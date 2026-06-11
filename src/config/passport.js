const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const Account = require("../models/Account");
const { createSessionToken, hashPassword, verifyPassword } = require("../utils/auth");

function configurePassport() {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password"
      },
      async (email, password, done) => {
        try {
          const account = await Account.findOne({ email: String(email).toLowerCase() }).select("+password");
          if (!account) {
            return done(null, false, { message: "Invalid credentials" });
          }

          const isValid = verifyPassword(password, account.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid credentials" });
          }

          account.lastSeenAt = new Date();
          await account.save();

          return done(null, account);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            if (!email) {
              return done(new Error("Google account email is required"));
            }

            const name = profile.displayName || profile.name?.givenName || email.split("@")[0] || "Google User";
            let account = await Account.findOne({ email });

            if (account) {
              account.googleId = profile.id;
              account.authProvider = "google";
              account.name = account.name || name;
              account.lastSeenAt = new Date();
              await account.save();
            } else {
              account = await Account.create({
                name,
                email,
                password: hashPassword(createSessionToken()),
                phone: "",
                role: "customer",
                googleId: profile.id,
                authProvider: "google"
              });
            }

            return done(null, account);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((account, done) => {
    done(null, String(account._id));
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const account = await Account.findById(id);
      done(null, account);
    } catch (error) {
      done(error);
    }
  });

  return passport;
}

module.exports = configurePassport;
