const passport = require('passport');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User');
const mailer = require('../modules/mailer');
const axios = require('axios')
require('dotenv').config();

const FacebookStrategy = require('passport-facebook').Strategy;

const getFacebookProfilePicture = async (accessToken, userId) => {
    try {
      const response = await axios.get(`https://graph.facebook.com/${userId}`, {
        params: {
          fields: 'picture.width(400).height(400)',
          access_token: accessToken
        }
      });
      const pictureUrl = response.data.picture.data.url;
      return pictureUrl;
    } catch (error) {
      console.error('Erro ao obter a imagem de perfil:', error);
      return null;
    }
  };

passport.use(
    new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'photos']
    },
        async (accessToken, refreshToken, profile, done) => {

            const img = await getFacebookProfilePicture(accessToken, profile.id);

            try {
                let user = await UserModel.findOne({ googleId: profile.id });

                if (!user) {
                    user = await UserModel.findOne({ email: profile.emails[0].value });

                    if (!user) {
                        user = await UserModel.create({
                            facebookId: profile.id,
                            name: profile.name.givenName + " " + profile.name.familyName,
                            email: profile.emails[0].value,
                            nickname: (profile.name.givenName + profile.name.familyName).replaceAll(" ", "").toLowerCase() + "_" + new Date().getTime(),
                            img: img
                        });

                        if (process.env.SEND_REGISTER_EMAIL === "true") {
                            mailer.sendMail({
                                to: profile.emails[0].value,
                                from: `IAcademy <${process.env.USER_EMAIL}>`,
                                template: 'new_account_facebook',
                                context: { name: profile.name.givenName, provider: 'Facebook' },
                                subject: "Obrigado por criar sua conta com o Facebook - IAcademy"
                            }, (err) => {
                                if (err)
                                    res.status(400).json({ message: err })
                            });
                        }
                    }
                }

                const payload = { id: user._id };
                const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
          
                done(null, { user, token });
            } catch (err) {
                done(err, null);
            }
        })
);
