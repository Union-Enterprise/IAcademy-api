const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => app.emit('ready'))
  .catch(e => console.log(e));

app.on('ready', () => app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
}));
