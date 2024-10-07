const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User');
const mailer = require('../modules/mailer');
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
            nickname: profile.displayName.replaceAll(" ", "").toLowerCase() + "_" + new Date().getTime(),
            img: (profile.photos[0].value).replace("=s96-c", "=s288-c-no")
          });


          if (process.env.SEND_REGISTER_EMAIL === "true") {
            mailer.sendMail({
              to: profile.emails[0].value,
              from: `IAcademy <${process.env.USER_EMAIL}>`,
              template: 'new_account_google',
              context: { name: profile.displayName, provider: 'Google' },
              subject: "Obrigado por criar sua conta com o Google - IAcademy"
            }, (err) => {
              if (err)
                return;
            })
          }
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
