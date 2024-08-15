const route = require('express').Router()

const account = require('./src/controllers/account')
const loginRequired = require("./src/middlewares/loginRequired")

route.get('/', (req, res) => {
    res.json('oi');
})

route.post('/login', account.login);
route.post('/signup', account.register);
route.delete('/delete', loginRequired.loginRequired, account.delete);

module.exports = route;