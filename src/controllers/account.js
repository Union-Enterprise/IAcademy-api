const jwt = require('jsonwebtoken');

const { User } = require('../models/User');

exports.login = async (req, res) => {
    const login = new User(req.body);
    const user = await login.login();

    if(login.errors.length > 0){
        return res.json(login.errors)
    }

    const { id, name, email } = user;
    const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION
    })

    res.json({ id, name, email, token })
}

exports.register = async (req, res) => {
    try{    
        const login = new User(req.body);
        const user = await login.register();
        if(login.errors.length > 0){
            return res.json(login.errors);
        }
        res.json(user)
      }catch(e){
        console.log(e);
      }
}

exports.delete = async (req, res) => {
    try{
        console.log(req.userId)
        
        const user = new User({ id: req.userId, email: req.userEmail, name: req.userName });

        const userDel = await user.delete()

        console.log(userDel)

        res.json("Usuário deletado com sucesso.")
    }catch(err){
        res.json("Usuário não pode ser deletado.")
    }
}