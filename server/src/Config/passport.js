const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;

const { db } = require("../DB/database");
const { users } = require("../DB/schema");
const { eq } = require("drizzle-orm");

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_CALLBACK_URL
) {
  throw new Error("Missing Google OAuth environment variables.");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account does not provide an email"));
        }

        const existingGoogleUser = await db
          .select()
          .from(users)
          .where(eq(users.googleId, googleId))
          .limit(1);

        if (existingGoogleUser.length > 0) {
          return done(null, existingGoogleUser[0]);
        }

        const existingEmailUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingEmailUser.length > 0) {
          const user = existingEmailUser[0];
          if (!user.googleId) {
            const updatedUser = await db
              .update(users)
              .set({ googleId, updatedAt: new Date() })
              .where(eq(users.id, user.id))
              .returning();
            return done(null, updatedUser[0]);
          }
          return done(null, user);
        }

        const newUser = await db
          .insert(users)
          .values({
            name: profile.displayName,
            email,
            googleId,
            password: null,
          })
          .returning();

        return done(null, newUser[0]);
      } catch {
        return done(new Error("Error during Google OAuth process"));
      }
    },
  ),
);

if (
  !process.env.DISCORD_CLIENT_ID ||
  !process.env.DISCORD_CLIENT_SECRET ||
  !process.env.DISCORD_CALLBACK_URL
) {
  throw new Error("Missing Discord OAuth environment variables.");
}

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,

      scope: ["identify", "email"],
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const discordId = profile.id;
        const email = profile.email;

        if (!email) {
          return done(new Error("Discord account does not provide an email"));
        }

        const existingDiscordUser = await db
          .select()
          .from(users)
          .where(eq(users.discordId, discordId))
          .limit(1);

        if (existingDiscordUser.length > 0) {
          return done(null, existingDiscordUser[0]);
        }

        const existingEmailUser = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (existingEmailUser.length > 0) {
          const user = existingEmailUser[0];
          if (!user.discordId) {
            const updatedUser = await db
              .update(users)
              .set({ discordId, updatedAt: new Date() })
              .where(eq(users.id, user.id))
              .returning();
            return done(null, updatedUser[0]);
          }
          return done(null, user);
        }

        const newUser = await db
          .insert(users)
          .values({
            name: profile.username || "Discord User",
            email,
            discordId,
            password: null,
          })
          .returning();

        return done(null, newUser[0]);
      } catch {
        return done(new Error("Error during Discord OAuth process"));
      }
    },
  ),
);

module.exports = passport;