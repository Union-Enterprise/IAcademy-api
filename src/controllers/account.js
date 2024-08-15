const jwt = require('jsonwebtoken');

const { User } = require('../models/User');

exports.login = async (req, res) => {
    const login = new User(req.body);
    const user = await login.login();

    if(login.errors.length > 0){
        return res.json(login.errors)
    }

    const { id, name, email } = user;
    const token = jwt.sign({ id }, process.env.TOKEN_SECRET, {
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

exports.del = async (req, res) => {
    try{        
        const user = new User({ id: req.userId, email: req.userEmail, name: req.userName });

        const userDel = await user.delete()

        console.log(userDel)

        res.json("Usuário deletado com sucesso.")
    }catch(err){
        res.json("Usuário não pode ser deletado.")
    }
}

exports.updateName = async (req, res) => {
    try{        
        const user = new User({ id: req.userId, name: req.body.name });

        const userUpdated = await user.updateName()

        if(user.errors.length > 0){
            return res.json(user.errors);
        }

        res.json({
            message: "Nome de usuário alterado com sucesso.",
            user: userUpdated
        })
    }catch(err){
        res.json("Nome de usuário não pode ser alterado.")
    }
}

exports.updateEmail = async (req, res) => {
    try{        
        const user = new User({ id: req.userId, email: req.body.email });

        const userUpdated = await user.updateEmail()

        if(user.errors.length > 0){
            return res.json(user.errors);
        }

        res.json({
            message: "Email de usuário alterado com sucesso.",
            user: userUpdated
        })
    }catch(err){
        console.log(err)
        res.json({
            message: "Email de usuário não pode ser alterado"
        })
    }
}

exports.updatePassword = async (req, res) => {
    try{        
        const user = new User({ id: req.userId, password: req.body.password });

        const userUpdated = await user.updatePassword()

        if(user.errors.length > 0){
            return res.json(user.errors);
        }

        res.json({
            message: "Senha de usuário alterada com sucesso.",
            user: userUpdated
        })
    }catch(err){
        console.log(err)
        res.json({
            message: "Senha de usuário não pode ser alterada"
        })
    }
}