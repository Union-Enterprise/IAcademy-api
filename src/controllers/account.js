const Login = require('../models/Login')

exports.login = async (req, res) => {
    const login = new Login(req.body);
    const user = await login.login();

    if(login.errors.length > 0){
        return res.json(login.errors)
    }

    res.json(user)
}

exports.register = async (req, res) => {
    try{    
        const login = new Login(req.body);
        const user = await login.register();
        if(login.errors.length > 0){
            return res.json(login.errors);
        }
        res.json(user)
      }catch(e){
        console.log(e);
      }
}