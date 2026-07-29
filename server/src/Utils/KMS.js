const crypto = require("crypto");

/**
 *  /$$   /$$ /$$      /$$  /$$$$$$
 *  | $$  /$$/| $$$    /$$$ /$$__  $$
 *  | $$ /$$/ | $$$$  /$$$$| $$  \__/
 *  | $$$$$/  | $$ $$/$$ $$|  $$$$$$
 *  | $$  $$  | $$  $$$| $$ \____  $$
 *  | $$\  $$ | $$\  $ | $$ /$$  \ $$
 *  | $$ \  $$| $$ \/  | $$|  $$$$$$/
 *  |__/  \__/|__/     |__/ \______/
 *
 * ============================================================================
 *  RafidKMS -- Lightweight Key Management System
 * ============================================================================
 *
 * @author   https://github.com/rafidahmed870
 * @module   RafidKMS
 *
 * WHAT IS THIS?
 * -------------
 * RafidKMS is a self-hosted, dependency-free Key Management System that
 * mimics the trust model of SSL/TLS: every client application gets its own
 * keypair. The PUBLIC key ("App Key") is handed out freely and can only be
 * used to ENCRYPT data. The PRIVATE key never leaves the server, and is
 * itself stored encrypted at rest -- wrapped by a single root secret called
 * the Master Key.
 *
 * HOW IT WORKS (Envelope / Hybrid Encryption)
 * --------------------------------------------
 *   1. Each registered app gets a fresh RSA-2048 keypair.
 *      - Public key  -> distributed to the client as the "App Key".
 *      - Private key -> AES-256-GCM encrypted using the Master Key, then
 *                        stored in the database (never in plaintext).
 *
 *   2. To send data, the client:
 *      - Generates a random one-time AES-256 key.
 *      - Encrypts the actual payload with that AES key (AES-256-GCM).
 *      - Encrypts the AES key itself with the app's RSA public key.
 *      - Ships { encryptedKey, iv, authTag, ciphertext } to the server.
 *
 *   3. To read data, the server:
 *      - Unwraps the app's private key using the Master Key.
 *      - Uses the private key to decrypt the one-time AES key.
 *      - Uses the AES key to decrypt the actual payload.
 *
 * This keeps large payloads fast (AES) while keeping key distribution safe
 * (RSA) -- exactly how TLS handshakes work under the hood.
 *
 * SECURITY NOTES
 * ---------------
 *   - The Master Key must NEVER be stored in the database. Load it from an
 *     environment variable, secret manager, or vault at runtime only.
 *   - Losing the Master Key means every wrapped private key becomes
 *     unrecoverable -- back it up securely.
 *   - AES-GCM's auth tag gives you tamper detection for free; a modified
 *     ciphertext will throw during decryption instead of silently failing.
 * ============================================================================
 */
class RafidKMS {
  /**
   * @param {string} masterKey - Base64 encoded 32-byte (256-bit) root secret.
   *                             Generate one with:
   *                             node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   */
  constructor(masterKey) {
    if (!masterKey) {
      throw new Error("Master key is required for RafidKMS");
    }

    const keyBuffer = Buffer.from(masterKey, "base64");
    if (keyBuffer.length !== 32) {
      throw new Error("Master key must decode to exactly 32 bytes (256-bit)");
    }

    this.masterKey = keyBuffer;
  }

  // ==========================================================================
  // 1. APP KEYPAIR GENERATION
  // ==========================================================================

  /**
   * Generates a brand new RSA-2048 keypair for a client application.
   * The private key is immediately wrapped (encrypted) with the Master Key
   * so it is safe to persist directly in the database.
   *
   * @returns {{
   *   appKey: string,               // base64 public key -> give this to the client
   *   publicKey: string,            // raw PEM public key (optional, for logging/debug)
   *   encryptedPrivateKey: string,  // base64 -> store in DB
   *   privateKeyIv: string,         // base64 -> store in DB
   *   privateKeyAuthTag: string     // base64 -> store in DB
   * }}
   */
  generateAppKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    const wrapped = this._wrapPrivateKey(privateKey);

    return {
      appKey: Buffer.from(publicKey).toString("base64"),
      publicKey,
      encryptedPrivateKey: wrapped.encryptedPrivateKey,
      privateKeyIv: wrapped.iv,
      privateKeyAuthTag: wrapped.authTag,
    };
  }

  // ==========================================================================
  // 2. MASTER-KEY LEVEL WRAP / UNWRAP  (private key <-> master key)
  // ==========================================================================

  /**
   * Encrypts (wraps) a PEM private key using the Master Key (AES-256-GCM).
   * @private
   */
  _wrapPrivateKey(privateKeyPem) {
    const iv = crypto.randomBytes(12); // 12 bytes recommended for GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", this.masterKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(privateKeyPem, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedPrivateKey: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
    };
  }

  /**
   * Decrypts (unwraps) a stored private key back into usable PEM format.
   * @private
   */
  _unwrapPrivateKey(encryptedPrivateKey, iv, authTag) {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.masterKey,
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPrivateKey, "base64")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  // ==========================================================================
  // 3. CLIENT-SIDE: ENCRYPT PAYLOAD (uses App Key / public key only)
  // ==========================================================================

  /**
   * Encrypts an arbitrary payload using an app's public key ("App Key").
   * This is what the CLIENT application calls -- it never needs the
   * Master Key or the private key, only the public App Key.
   *
   * @param {object} payload      - Any JSON-serializable data.
   * @param {string} appKeyBase64 - The base64 "App Key" (public key) issued to the client.
   * @returns {{ encryptedKey: string, iv: string, authTag: string, ciphertext: string }}
   */
  encryptPayload(payload, appKeyBase64) {
    const publicKey = Buffer.from(appKeyBase64, "base64").toString("utf8");

    // Step 1: one-time AES-256 key + IV
    const aesKey = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);

    // Step 2: encrypt the actual payload with AES-256-GCM
    const cipher = crypto.createCipheriv("aes-256-gcm", aesKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(payload), "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Step 3: encrypt the AES key with the RSA public key (App Key)
    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      aesKey
    );

    return {
      encryptedKey: encryptedKey.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
      ciphertext: ciphertext.toString("base64"),
    };
  }

  // ==========================================================================
  // 4. SERVER-SIDE: DECRYPT PAYLOAD (uses Master Key -> private key)
  // ==========================================================================

  /**
   * Decrypts a payload previously produced by `encryptPayload()`.
   * This is what the SERVER calls -- it needs the wrapped private key
   * (fetched from the DB for the relevant app) plus the Master Key
   * that was passed into the constructor.
   *
   * @param {object} encryptedPayload
   * @param {string} encryptedPayload.encryptedKey - base64 RSA-encrypted AES key
   * @param {string} encryptedPayload.iv           - base64 IV used for payload AES-GCM
   * @param {string} encryptedPayload.authTag       - base64 auth tag for payload AES-GCM
   * @param {string} encryptedPayload.ciphertext    - base64 encrypted payload
   * @param {object} wrappedPrivateKey
   * @param {string} wrappedPrivateKey.encryptedPrivateKey - base64, from DB
   * @param {string} wrappedPrivateKey.iv                  - base64, from DB
   * @param {string} wrappedPrivateKey.authTag             - base64, from DB
   * @returns {object} the original decrypted JSON payload
   */
  decryptPayload(encryptedPayload, wrappedPrivateKey) {
    const { encryptedKey, iv, authTag, ciphertext } = encryptedPayload;
    const {
      encryptedPrivateKey,
      iv: privateKeyIv,
      authTag: privateKeyAuthTag,
    } = wrappedPrivateKey;

    // Step 1: unwrap the app's private key using the Master Key
    const privateKeyPem = this._unwrapPrivateKey(
      encryptedPrivateKey,
      privateKeyIv,
      privateKeyAuthTag
    );

    // Step 2: decrypt the one-time AES key with the RSA private key
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedKey, "base64")
    );

    // Step 3: decrypt the actual payload with the AES key
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      aesKey,
      Buffer.from(iv, "base64")
    );
    decipher.setAuthTag(Buffer.from(authTag, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, "base64")),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  }

  // ==========================================================================
  // 5. KEY ROTATION HELPER (optional, for future use)
  // ==========================================================================

  /**
   * Re-wraps an existing private key under a NEW master key. Useful when
   * rotating the Master Key itself -- decrypt every app's private key with
   * the OLD RafidKMS instance's `_unwrapPrivateKey`, then re-wrap it here
   * with a new RafidKMS instance holding the new Master Key.
   *
   * @param {string} privateKeyPem - plaintext PEM private key (already unwrapped)
   * @returns {{ encryptedPrivateKey: string, iv: string, authTag: string }}
   */
  rewrapPrivateKey(privateKeyPem) {
    return this._wrapPrivateKey(privateKeyPem);
  }
}

module.exports = RafidKMS;