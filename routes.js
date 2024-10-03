const route = require('express').Router();
const multer = require('multer');
const passport = require('passport');
const mongoose = require('mongoose');
const { login, register, del, updateName, updateEmail, updatePassword, updateCPF, updateIMG, getUser, exit, verifyToken, updatePasswordAccess, forgotPassword, resetPassword, getRecentUsersADM, usersByMonth, usersTotal, updateProfile, updateAddress, getUsersADM } = require('./src/controllers/account');
const { loginRequired } = require("./src/middlewares/loginRequired");
const { loginAdmRequired } = require("./src/middlewares/loginAdmRequired");
const { storage, fileFilter } = require('./src/config/multerConfig');
const { googleCallback } = require('./src/controllers/google');
const { facebookCallback } = require('./src/controllers/facebook');


const upload = multer({ storage: storage, fileFilter: fileFilter, limits: {
    fileSize: 1024 * 1024 * 25
}});

route.post('/login', login);
route.post('/signup', register);
route.post('/forgot_password', forgotPassword);
route.post('/verify_token', verifyToken);
route.post('/reset_password', resetPassword)

route.delete('/delete', loginRequired, del);
route.put("/compare", loginRequired, updatePasswordAccess)
route.put('/update_name', loginRequired, updateName);
route.put('/update_email', loginRequired, updateEmail);
route.put('/update_password', loginRequired, updatePassword);
route.put('/update_cpf', loginRequired, updateCPF);
route.put('/update_profile', loginRequired, updateProfile);
route.put("/update_address", loginRequired, updateAddress)

route.delete('/exit', loginRequired, exit)

//upload
route.post("/upload_pfp", loginRequired, upload.single('file'), updateIMG)

//login necessario
route.get("/profile", loginRequired, getUser)

// google login
route.get('/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'], session: false}));
route.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login', session: false }), googleCallback);
// facebook login
route.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
route.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: 'http://localhost:3000/login', session: false }), facebookCallback);


// rotas adm
route.post('/login_adm', (req, res) => {
    req.body.type="adm";
    login(req, res);
});

route.post('/recent_users', loginAdmRequired, getRecentUsersADM);
route.get('/users', loginAdmRequired, getUsersADM);
route.get('/users_by_month', loginAdmRequired, usersByMonth);
route.get('/users_total', loginAdmRequired, usersTotal);

// ia
route.get('/roadmap', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('roadmap');
        const dados = await collection.find({}).toArray();
        res.status(200).json(dados);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter dados', error });
    }
});


module.exports = route;