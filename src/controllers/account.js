const jwt = require('jsonwebtoken');

const { User } = require('../models/User');

const login = async (req, res) => {
    const login = new User(req.body);
    const user = await login.login();

    if(login.errors.length > 0){
        return res.json(login.errors)
    }

    const { id, name, email, img, links, is_premium } = user;
    const token = jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION
    })

    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 7000 
      });

    return res.json({ id, name, email, img, links, is_premium, token })
}

exports.register = async (req, res) => {
    try{    
        req.body.nickname = req.body.name.replace(" ", "")
        req.body.nickname = req.body.nickname.toLowerCase()+"_"+new Date().getTime();
        const userModel = new User(req.body);
        await userModel.register();
        if(userModel.errors.length > 0){
            return res.json(userModel.errors);
        }
        
        return await login(req, res);
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

exports.updateCPF = async (req, res) => {
    try{
        const user = new User({ id: req.userId, cpf: req.body.cpf })

        const userUpdated = await user.updateCPF();

        if(user.errors.length > 0){
            return res.json(user.errors);
        }
        
        res.json({
            message: "CPF alterado com sucesso.",
            user: userUpdated
        })
    }catch(err){
        console.log(err)
        res.json({
            message: "CPF não pode ser alterado"
        })
    }
}

exports.updateIMG = async (req, res) => {
    try{
        const user = new User({ id: req.userId, img: req.file.filename })

        const userUpdated = await user.updateIMG();

        if(user.errors.length > 0){
            return res.json(user.errors);
        }
        
        res.json({
            message: "Imagem alterada com sucesso.",
            user: userUpdated
        })
    }catch(err){
        console.log(err)
        res.json({
            message: "Não foi possivel definir imagem de perfil"
        })
    }
}

exports.getUser = async (req, res) => {
    try{
        const user = new User({ id: req.userId })

        const usergetted = await user.getUser()

        if(user.errors.length > 0){
            return res.json(user.errors);
        }
        
        res.json(usergetted)
    }catch(err){
        console.log(err)
        res.json({
            message: "Não foi possivel encontrar usuário"
        })
    }
}

exports.login = login;