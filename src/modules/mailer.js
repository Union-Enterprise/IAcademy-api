const path = require('path')
require('dotenv').config();

const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')


const transport = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.PASSWORD_EMAIL
    }
});

transport.use('compile', hbs({
    viewEngine: {
      defaultLayout: undefined,
      partialsDir: path.resolve('./src/resources/mail/')
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
}));
  

module.exports = transport;