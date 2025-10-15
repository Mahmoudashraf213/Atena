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
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: null,
            status: "verified",
            otpVerified: true,
          });
        }

        const token = generateToken({
          payload: { email: user.email, _id: user._id, role: user.role },
        });

        return done(null, { user, token });
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport;
