const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const mailer = require('../modules/mailer');
const { User } = require('../models/User');

require('dotenv').config();

const login = async (req, res) => {
    const login = new User(req.body);
    const user = await login.login();

    if(login.errors.length > 0){
        return res.status(401).json(login.errors)
    }

    const { id, name, email, img, links, is_premium, is_first_access } = user;
    const token = jwt.sign({ id }, process.env.TOKEN_SECRET, {
        expiresIn: process.env.TOKEN_EXPIRATION
    })

    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 7000 
    });

    return res.json({ id, name, email, img, links, is_premium, token, is_first_access })
}

exports.register = async (req, res) => {
    try{    
        req.body.nickname = req.body.name.replaceAll(" ", "");
        req.body.nickname = req.body.nickname.toLowerCase()+"_"+new Date().getTime();
        const userModel = new User(req.body);
        const user = await userModel.register();
        if(userModel.errors.length > 0){
            return res.json(userModel.errors);
        }
        
        if(process.env.SEND_REGISTER_EMAIL === "true"){
            mailer.sendMail({
                to: user.email,
                from: `IAcademy <${process.env.USER_EMAIL}>`,
                template: 'new_account',
                context: { name: user.name },
                subject: "Obrigado por criar sua conta - IAcademy"
            }, (err) => {
                if(err)
                    res.status(400).json({message: err})
            })
        }

        const { id, name, email, img, links, is_premium } = user;

        return res.json({ id, name, email, img, links, is_premium });
        // return await login(req, res);
    }catch(err){
        console.log(err);
    }
}

exports.del = async (req, res) => {
    try{        
        const user = new User({ id: req.userId, email: req.userEmail, name: req.userName });
        
        await user.delete();
    
        res.clearCookie("token");
        
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

exports.updateAddress = async (req, res) => {
    try{
        const user = new User({ id: req.userId, cep: req.body.cep, rua: req.body.rua, numero: req.body.numero, bairro: req.body.bairro, cidade: req.body.cidade, complemento: req.body.complemento, estado: req.body.estado})

        const userUpdated = await user.updateAddress();

        if(user.errors.length > 0){
            return res.json(user.errors);
        }
        
        res.json({
            message: "Endereço alterado com sucesso.",
            user: userUpdated
        })
    }catch(err){
        console.log(err)
        res.json({
            message: "Endereço não pode ser alterado"
        })
    }
}
exports.updateProfile= async (req, res) => {
    try{        
        const user = new User({ id: req.userId, name: req.body.name, nascimento: req.body.nascimento, genero: req.body.genero, telefone: req.body.telefone });
        
        if(req.body.genero!=""){
            user.updateGender();
        }
        if(req.body.nascimento!=""){
            user.updateBirth();
        }
        if(req.body.telefone!=""){
            user.updatePhone(); 
        } 
        const userUpdated = await user.updateName();
        if(user.errors.length > 0){
            return res.json(user.errors);
        }
        
        res.json({
            message: "Dados alterados com sucesso.",
            user: userUpdated
        })
    }catch(err){
        res.json("Alguns dos danos não conseguiram ser alterados.")
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

exports.updateStreak = async (req, res) => {
    try{
        const userId = req.body.userId || req.userId;
        if (!userId) {
            return res.status(400).json({ message: "User ID is missing" });
          }
        const user = new User({id: userId})
        const userUpdated = await user.updateStreak()
        if(user.errors.length >0){
            return res.json(user.errors);
        }
        res.json(userUpdated.streak)
    }catch(err){
        console.log(err)
        res.json({
            message: "Erro ao verificar streak"+err
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

exports.updatePasswordAccess = async (req, res) => {
    try{
        const user = new User({ id: req.userId, password: req.body.password });
        const senha1 = req.headers['oldpass']
        result = await user.comparePassword(senha1)

        console.log(senha1)

        if(result){
            const userUpdated = await user.updatePassword()
            if(user.errors.length > 0){
                return res.json(user.errors);
            }
            res.json({
                message: "Senha de usuário alterada com sucesso.",
                user: userUpdated
            })
        }else{
            res.json({
                message: "Insira uma senha correta."
            })
            return;
        }
        if(user.errors.length > 0){
            return res.json(user.errors)
        }
    } catch(err){
        console.log(err)
        res.json({
            message: "Não foi possível comparar senha"
        })
    }
}

exports.exit = async (req, res) => {
    try{
        res.clearCookie("token");
        res.json({
            message: "Saiu com sucesso"
        })
    }catch(err){
        console.log(err)
        res.json({
            message: "Não foi possivel sair"
        })
    }
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try{
        const user = new User({ email })
            
        const token = crypto.randomBytes(3).toString('hex');
        
        const now = new Date();
        now.setHours(now.getHours() + 1);
        
        const userData = await user.forgotPassword(email, token, now);

        if(!userData){
            return res.status(400).json({ message: "Usuario não encontrado" })
        }
        
        if(user.errors.length > 0){
            return res.json(user.errors);
        } 
        if(process.env.SEND_TOKEN_EMAIL === "true"){
            mailer.sendMail({
                to: email,
                from: `IAcademy <${process.env.USER_EMAIL}>`,
                template: 'forgot_password',
                context: { name: userData.name, token },
                subject: "Recuperação de senha - IAcademy"
            }, (err) => {
                if(err)
                    res.status(400).json({message: err})
            })
            res.json({ message: "Email enviado" })
        }else{
            res.status(400).json({ message: "O envio de email está desabilitado no momento, ative no .env" })
        }
    }catch(err){
        console.log(err);
        res.status(400).json({ message: "Erro ao recuperar a senha" })
    }
}

exports.resetPassword = async (req, res) => {
    const { email, token, password } = req.body;

    try{
        const user = new User({ email })

        const userUpdated = await user.resetPassword(token, password);

        if(user.errors.length > 0){
            return res.status(400).json(user.errors);
        }

        res.json(userUpdated);
    }catch(err){
        console.log(err)
        res.status(400).json({message: "Erro ao resetar senha"})
    }
}

exports.verifyToken = async (req, res) => {
    const { token, email } = req.body;

    try{
        const user = new User({ email })

        if(await user.verifyToken(token)){
            return res.status(200).json({"message": "Token valido!"});
        }

        if(user.errors.length > 0){
            return res.status(401).json(user.errors);
        }
    }catch(err){
        console.log(err)
        res.status(400).json({message: "Erro ao validar token"})
    }
}

exports.getRecentUsersADM = async (req, res) => {
    const user = new User();

    const users = await user.getRecentUsersADM(req.body.qtd);
    return res.json(users);
}

exports.usersByMonth = async (req, res) => {
    const user = new User()
    
    const usersbymonths = await user.usersByMonth();
    return res.status(200).json(usersbymonths);
}

exports.usersTotal = async (req, res) => {
    const user = new User()
    
    const qtd = await user.usersTotal();
    return res.status(200).json(qtd);
}

exports.getUsersADM = async (req, res) => {
    const user = new User();
    const { category, plan, status, nameRegex } = req.query;

    const users = await user.getUsersADM(category, plan, status, nameRegex);
    res.status(200).json(users);
}

exports.getUserBySearch = async (req, res) => {
    const user = new User();
    const search = req.body.name;

    const users = await user.getUsersBySearch(search);
    res.json(users);
}

exports.deleteUserADM = async (req, res) => {
    try{        
        const user = new User({ email: req.body.email });

        const userData = await user.ban();

        await mailer.sendMail({
            to: userData.email,
            from: `IAcademy <${process.env.USER_EMAIL}>`,
            template: 'ban_account',
            context: { name: userData.name },
            subject: "Sua conta foi suspensa - IAcademy"
        }, (err) => {
            if(err)
                res.status(400).json({message: err})
        })
        
        res.json("Usuário deletado com sucesso.")
    }catch(err){
        console.log(err)
        res.status(404).json("Usuário não pode ser deletado.")
    }
}

exports.restoreUserADM = async (req, res) => {
    try{        
        const user = new User({ email: req.body.email });
        
        const userData = await user.restore();

        await mailer.sendMail({
            to: userData.email,
            from: `IAcademy <${process.env.USER_EMAIL}>`,
            template: 'unban_account',
            context: { name: userData.name },
            subject: "Sua conta foi restaurada - IAcademy"
        }, (err) => {
            if(err)
                res.status(400).json({message: err})
        })
            
        res.json("Usuário restaurado com sucesso.")
    }catch(err){
        res.json("Usuário não pode ser restaurado.")
    }
}

exports.createADM = async (req, res) => {
    try{    
        req.body.nickname = req.body.name.replaceAll(" ", "");
        req.body.nickname = req.body.nickname.toLowerCase();
        const userModel = new User(req.body);
        const user = await userModel.createADM();
        if(userModel.errors.length > 0){
            return res.json(userModel.errors);
        }

        const { id, name, email, img, links, is_adm } = user;

        return res.json({ id, name, email, img, links, is_adm });
    }catch(err){
        console.log(err);
    }
}

exports.createUserAdmin = async (req, res) => {
    try{    
        req.body.nickname = req.body.name.replaceAll(" ", "");
        req.body.nickname = req.body.nickname.toLowerCase()+"_"+new Date().getTime();
        const userModel = new User(req.body);
        const user = await userModel.createUserAdmin();
        if(userModel.errors.length > 0){
            return res.json(userModel.errors);
        }

        const { id, name, email, img, links, is_adm } = user;

        return res.json({ id, name, email, img, links, is_adm });
    }catch(err){
        console.log(err);
    }
}

exports.is_first_access = async (req, res) => {
    try{
        const id = req.body.id;
        
        const user = new User();

        return user.is_first_access(id);
    }catch(err){
        console.log(err)
    }
}

exports.createRoadmap = async (req, res) => {
    console.log('create roadmap')
    try{
        const user = new User();

        await user.generateRoadmap(req.userId);
    }catch(err){
        console.log(err)
    }
}

exports.login = login;