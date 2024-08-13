const route = require('express').Router()

const account = require('./src/controllers/account')

route.get('/', (req, res) => {
    res.json('oi');
})

route.post('/login', account.login);
route.post('/signup', account.register);

module.exports = route;