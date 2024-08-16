const route = require('express').Router()

const { login, register, del, updateName, updateEmail, updatePassword, updateCPF } = require('./src/controllers/account')
const { loginRequired } = require("./src/middlewares/loginRequired")

route.get('/', (req, res) => {
    res.json('oi');
})

route.post('/login', login);
route.post('/signup', register);
route.delete('/delete', loginRequired, del);
route.put('/update_name', loginRequired, updateName);
route.put('/update_email', loginRequired, updateEmail);
route.put('/update_password', loginRequired, updatePassword);
route.put('/update_cpf', loginRequired, updateCPF);


module.exports = route;