const route = require('express').Router()
const multer = require('multer')

const { login, register, del, updateName, updateEmail, updatePassword, updateCPF, updateIMG, getUser, exit, getPasswordHash, comparePassword, updatePasswordAccess, forgotPassword, resetPassword } = require('./src/controllers/account')
const { loginRequired } = require("./src/middlewares/loginRequired")
const { storage, fileFilter } = require('./src/config/multerConfig')

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: {
    fileSize: 1024 * 1024 * 25
}});

route.get('/', (req, res) => {
    res.json('oi');
})

route.post('/login', login);
route.post('/signup', register);
route.post('/forgot_password', forgotPassword);
route.post('/reset_password', resetPassword)

route.delete('/delete', loginRequired, del);
route.put("/compare", loginRequired, updatePasswordAccess)
route.put('/update_name', loginRequired, updateName);
route.put('/update_email', loginRequired, updateEmail);
route.put('/update_password', loginRequired, updatePassword);
route.put('/update_cpf', loginRequired, updateCPF);

route.delete('/exit', loginRequired, exit)

//upload
route.post("/upload_pfp", loginRequired, upload.single('file'), updateIMG)

//login necessario
route.get("/profile", loginRequired, getUser)

module.exports = route;