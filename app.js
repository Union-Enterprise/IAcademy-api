const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passportJWT = require('./src/config/passportJWTConfig'); 
const passport = require('passport');
require('dotenv').config();

require('./src/config/passportGoogleConfig');
require('./src/config/passportFacebookConfig');

const cors = require('cors');

const app = express();

app.use(cookieParser());
app.use(passport.initialize());

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization, oldPass',
    credentials: true
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use('/files', express.static("uploads"));

const routes = require('./routes');
app.use(routes);

const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(async () => {
    app.emit('ready');
  })
  .catch(err => console.log(err));

app.on('ready', () => app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
}));

exports.mongoose = mongoose;