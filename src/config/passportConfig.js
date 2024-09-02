const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User');
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/google/callback",
  scope: ["profile", "email"],
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await UserModel.findOne({ googleId: profile.id });

    if (!user) {
      user = await UserModel.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = await UserModel.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          nickname: profile.displayName.replaceAll(" ", "").toLowerCase()+"_"+new Date().getTime(),
          img: profile.photos[0].value
        });
      }
    }

    const payload = { id: user._id };
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });

    done(null, { user, token });
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
