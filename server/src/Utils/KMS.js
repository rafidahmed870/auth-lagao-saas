const crypto = require("crypto");

/**
 * ============================================================================
 *  RafidKMS -- Lightweight Key Management System
 * ============================================================================
 *
 * @author   https://github.com/rafidahmed870
 * @module   RafidKMS
 *
 * WHAT IS THIS?
 * -------------
 * RafidKMS is a self-hosted, dependency-free Key Management System.
 * Every client application gets its own X25519 keypair. The PUBLIC key
 * ("App Key") is handed to the client and used to derive a shared secret
 * via ECDH. The PRIVATE key never leaves the server, stored AES-256-GCM
 * encrypted at rest -- wrapped by the root Master Key.
 *
 * WHY X25519 INSTEAD OF RSA-2048?
 * --------------------------------
 * - X25519 key generation is ~100x faster than RSA-2048.
 * - Keys are 32 bytes vs ~294 bytes for RSA-2048 public keys.
 * - Equivalent or better security at far lower computational cost.
 * - X25519 is the ECDH variant of Ed25519, designed specifically for
 *   fast, secure key agreement (encryption use-case).
 *
 * HOW IT WORKS (ECDH Hybrid Encryption)
 * ----------------------------------------
 *   1. Each registered app gets a fresh X25519 keypair.
 *      - Public key  -> distributed to the client as the "App Key".
 *      - Private key -> AES-256-GCM encrypted using the Master Key, then
 *                        stored in the database (never in plaintext).
 *
 *   2. To send data, the client:
 *      - Generates a random ephemeral X25519 keypair.
 *      - Performs ECDH: ephemeral private key + app public key -> shared secret.
 *      - Derives a one-time AES-256 key from the shared secret via HKDF-SHA256.
 *      - Encrypts the payload with AES-256-GCM.
 *      - Ships { ephemeralPublicKey, iv, authTag, ciphertext } to the server.
 *
 *   3. To read data, the server:
 *      - Unwraps the app's X25519 private key using the Master Key.
 *      - Performs ECDH: app private key + ephemeral public key -> same shared secret.
 *      - Re-derives the AES-256 key via HKDF-SHA256.
 *      - Decrypts the payload with AES-256-GCM.
 *
 * SECURITY NOTES
 * ---------------
 *   - The Master Key must NEVER be stored in the database. Load it from an
 *     environment variable, secret manager, or vault at runtime only.
 *   - Losing the Master Key means every wrapped private key becomes
 *     unrecoverable -- back it up securely.
 *   - AES-GCM auth tag gives tamper detection; a modified ciphertext will
 *     throw during decryption instead of silently failing.
 *   - Each encryption produces a fresh ephemeral keypair, providing
 *     forward secrecy: past sessions cannot be decrypted even if the
 *     app's long-term private key is later compromised.
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
   * Generates a brand new X25519 keypair for a client application.
   * X25519 is used for ECDH key agreement (hybrid encryption).
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
    const { publicKey, privateKey } = crypto.generateKeyPairSync("x25519", {
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
   * Encryption flow (ECDH hybrid):
   *   1. Generate a fresh ephemeral X25519 keypair.
   *   2. Perform ECDH: ephemeralPrivate + appPublic -> sharedSecret.
   *   3. Derive a one-time AES-256 key from sharedSecret via HKDF-SHA256.
   *   4. Encrypt the payload with AES-256-GCM using the derived key.
   *   5. Include the ephemeral public key in the output so the server
   *      can reproduce the same shared secret on its side.
   *
   * @param {object} payload      - Any JSON-serializable data.
   * @param {string} appKeyBase64 - The base64 "App Key" (public key) issued to the client.
   * @returns {{
   *   ephemeralPublicKey: string,  // base64 -- replaces the old encryptedKey field
   *   iv: string,
   *   authTag: string,
   *   ciphertext: string
   * }}
   */
  encryptPayload(payload, appKeyBase64) {
    const appPublicKeyPem = Buffer.from(appKeyBase64, "base64").toString("utf8");

    // Step 1: ephemeral X25519 keypair (one-time, forward secrecy)
    const ephemeral = crypto.generateKeyPairSync("x25519");

    // Step 2: ECDH shared secret
    const appPublicKey = crypto.createPublicKey(appPublicKeyPem);
    const sharedSecret = crypto.diffieHellman({
      privateKey: ephemeral.privateKey,
      publicKey: appPublicKey,
    });

    // Step 3: derive a 32-byte AES key via HKDF-SHA256
    const aesKey = crypto.hkdfSync(
      "sha256",
      sharedSecret,
      Buffer.alloc(0), // salt (empty = no salt)
      Buffer.from("RafidKMS-v2-enc"), // info label
      32
    );

    // Step 4: encrypt the payload with AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(aesKey), iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(payload), "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Step 5: export ephemeral public key so server can reproduce shared secret
    const ephemeralPublicKeyPem = ephemeral.publicKey.export({
      type: "spki",
      format: "pem",
    });

    return {
      ephemeralPublicKey: Buffer.from(ephemeralPublicKeyPem).toString("base64"),
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
   * Decryption flow (ECDH hybrid):
   *   1. Unwrap the app's X25519 private key using the Master Key.
   *   2. ECDH: appPrivate + ephemeralPublic -> same sharedSecret.
   *   3. Re-derive the AES-256 key via HKDF-SHA256 (same params as encrypt).
   *   4. Decrypt the payload with AES-256-GCM.
   *
   * @param {object} encryptedPayload
   * @param {string} encryptedPayload.ephemeralPublicKey - base64 ephemeral X25519 public key
   * @param {string} encryptedPayload.iv                 - base64 IV used for payload AES-GCM
   * @param {string} encryptedPayload.authTag            - base64 auth tag for payload AES-GCM
   * @param {string} encryptedPayload.ciphertext         - base64 encrypted payload
   * @param {object} wrappedPrivateKey
   * @param {string} wrappedPrivateKey.encryptedPrivateKey - base64, from DB
   * @param {string} wrappedPrivateKey.iv                  - base64, from DB
   * @param {string} wrappedPrivateKey.authTag             - base64, from DB
   * @returns {object} the original decrypted JSON payload
   */
  decryptPayload(encryptedPayload, wrappedPrivateKey) {
    const { ephemeralPublicKey, iv, authTag, ciphertext } = encryptedPayload;
    const {
      encryptedPrivateKey,
      iv: privateKeyIv,
      authTag: privateKeyAuthTag,
    } = wrappedPrivateKey;

    // Step 1: unwrap the app's X25519 private key using the Master Key
    const privateKeyPem = this._unwrapPrivateKey(
      encryptedPrivateKey,
      privateKeyIv,
      privateKeyAuthTag
    );

    // Step 2: ECDH shared secret
    const appPrivateKey = crypto.createPrivateKey(privateKeyPem);
    const ephemeralPubKey = crypto.createPublicKey(
      Buffer.from(ephemeralPublicKey, "base64").toString("utf8")
    );
    const sharedSecret = crypto.diffieHellman({
      privateKey: appPrivateKey,
      publicKey: ephemeralPubKey,
    });

    // Step 3: re-derive the AES-256 key (must match encryptPayload params exactly)
    const aesKey = crypto.hkdfSync(
      "sha256",
      sharedSecret,
      Buffer.alloc(0),
      Buffer.from("RafidKMS-v2-enc"),
      32
    );

    // Step 4: decrypt the actual payload with AES-256-GCM
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(aesKey),
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
