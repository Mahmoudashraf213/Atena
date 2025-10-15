import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../../db/index.js";
import { generateToken } from "./token.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://atena-beta.vercel.app/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;

      User.findOne({ email })
        .then((existingUser) => {
          if (existingUser) return existingUser;

          const newUser = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: null,
            status: "verified",
            otpVerified: true,
          });

          return newUser.save();
        })
        .then((user) => {
          const token = generateToken({
            payload: { email: user.email, _id: user._id, role: user.role },
          });
          done(null, { user, token });
        })
        .catch((error) => done(error, null));
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
