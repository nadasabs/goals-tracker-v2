// src/config/passportGoogle.js
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

module.exports = function setupGooglePassport(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // must match Google Console
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const rawEmail = profile.emails?.[0]?.value;
          const name = profile.displayName || "";
          const email = rawEmail ? rawEmail.toLowerCase().trim() : "";

          if (!email) return done(null, false);

          // Find user by email (normalized to match User schema)
          let user = await User.findOne({ email });

          // Create user if not exists
          if (!user) {
            user = await User.create({
              email,
              name,
              provider: "google",
              googleId: profile.id,
            });
          } else {
            // update basic fields (optional)
            user.googleId = user.googleId || profile.id;
            user.provider = user.provider || "google";
            user.name = user.name || name;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};