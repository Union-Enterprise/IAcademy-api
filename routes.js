const route = require('express').Router();
const multer = require('multer');
const passport = require('passport');
const mongoose = require('mongoose');
const { login, register, del, updateName, updateEmail, updatePassword, updateCPF, updateIMG, updateStreak, getUser, exit, verifyToken, updatePasswordAccess, forgotPassword, resetPassword, getRecentUsersADM, usersByMonth, usersTotal, updateProfile, updateAddress, getUsersADM, deleteUserADM, restoreUserADM, getUserBySearch, createADM, createUserAdmin, createRoadmap, finishTest, getResult, getAllProvas } = require('./src/controllers/account');
const { createQuiz, deleteQuiz, getAllQuizzes, getQuizById, updateQuiz, registerInUser } = require('./src/controllers/initialquiz');
const { sendReport, getReports, totalReports, solveReport, unsolveReport } = require('./src/controllers/report');
const { createSimulado, getAllSimulados, getSimulado, getProva, getQuestao, deleteSimulado, deleteProva, deleteQuestao, createProva, createQuestion, uploadQuestionImage } = require('./src/controllers/simulado')

const { loginRequired } = require("./src/middlewares/loginRequired");
const { loginAdmRequired } = require("./src/middlewares/loginAdmRequired");
const { storage, fileFilter } = require('./src/config/multerConfig');
const { googleCallback } = require('./src/controllers/google');
const { facebookCallback } = require('./src/controllers/facebook');
const { ObjectId } = require("mongodb");

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter, 
    limits: { fileSize: 1024 * 1024 * 25 } 
});

route.post('/login', login);
route.post('/signup', register);
route.post('/forgot_password', forgotPassword);
route.post('/verify_token', verifyToken);
route.post('/reset_password', resetPassword);

route.delete('/delete', loginRequired, del);
route.put("/compare", loginRequired, updatePasswordAccess);
route.put('/update_name', loginRequired, updateName);
route.put('/update_email', loginRequired, updateEmail);
route.put('/update_password', loginRequired, updatePassword);
route.put('/update_cpf', loginRequired, updateCPF);
route.put('/update_profile', loginRequired, updateProfile);
route.put("/update_address", loginRequired, updateAddress);
route.put('/update_streak', loginRequired, updateStreak);
route.put('/finish_test', loginRequired, finishTest);


route.delete('/exit', loginRequired, exit);

// upload
route.post("/upload_pfp", loginRequired, upload.single('file'), updateIMG);

// login necessario
route.get("/profile", loginRequired, getUser);
route.get("/results/:userId/:simuladoId/", getAllProvas);
route.get("/results/:userId/:simuladoId/:provaIndex", getResult);

// google login
route.get('/google', passport.authenticate('google', { 
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'], 
    session: false 
}));
route.get('/google/callback', passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login', 
    session: false 
}), googleCallback);

// facebook login
route.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
route.get('/facebook/callback', passport.authenticate('facebook', { 
    failureRedirect: 'http://localhost:3000/login', 
    session: false 
}), facebookCallback);

// rotas adm
route.post('/create_adm', loginAdmRequired, createADM);
route.post('/create_user_adm', loginAdmRequired, createUserAdmin);
route.post('/login_adm', (req, res) => {
    req.body.type = "adm";
    login(req, res);
});

route.post('/recent_users', loginAdmRequired, getRecentUsersADM);
route.get('/users', loginAdmRequired, getUsersADM);
route.get('/users_by_month', loginAdmRequired, usersByMonth);
route.get('/users_total', loginAdmRequired, usersTotal);
route.get('/user_search', getUserBySearch);
route.delete('/delete_user', loginAdmRequired, deleteUserADM);
route.post('/restore_user', loginAdmRequired, restoreUserADM);

// ia
route.post('/roadmap', loginRequired, async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        console.log(req.userEmail)
        const dados = await collection.find({ email: req.userEmail }).toArray();
        console.log(dados[0].topics)
        res.status(200).json(dados[0].topics);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter dados', error });
    }
});

route.get('/all_questions', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('quizes');
        const dados = await collection.find().toArray();
        res.status(200).json(dados);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao obter dados', error });
    }
});

route.put('/question/:id', async (req, res) => {
    const questionId = req.params.id;
    if (!ObjectId.isValid(questionId)) {
        console.log(req.params.id)
      return res.status(400).send("ID inválido.");
    }

    try {
        const db = mongoose.connection.db;
        const collection = db.collection('quizes');
        const { id } = req.params;
        const updatedQuestion = req.body;

        const result = await collection.updateOne(
            { _id: new mongoose.Types.ObjectId(id) }, 
            { $set: updatedQuestion }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Questão não encontrada' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao atualizar a questão', error });
    }
});

route.delete('/question/:id', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('quizes');
        const { id } = req.params;

        const result = await collection.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Questão não encontrada' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao deletar a questão', error });
    }
});

route.post('/question', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const collection = db.collection('quizes');
        const newQuestion = req.body;
        const result = await collection.insertOne(newQuestion);

        res.status(201).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erro ao criar a questão', error });
    }
});

route.post('/quiz', createQuiz);
route.get('/quizzes', getAllQuizzes);
route.get('/quiz/:id', getQuizById);
route.put('/quiz/:id', updateQuiz);
route.delete('/quiz/:id', deleteQuiz);

route.post('/report', sendReport);
route.get('/reports', getReports);
route.get('/total_reports', totalReports);
route.put('/solve', solveReport);
route.put('/unsolve', unsolveReport);

route.post('/simulado', createSimulado);
route.post('/simulado/:id', createProva);
route.post('/simulado/:id/:index', createQuestion);
route.post("/simulado/:id/:index/:question/upload", upload.single('file'), uploadQuestionImage);

route.get('/simulado', getAllSimulados);
route.get('/simulado/:id', getSimulado);
route.get('/simulado/:id/:index', getProva);
route.get('/simulado/:id/:index/:question', getQuestao);

route.delete('/simulado/:id', deleteSimulado);
route.delete('/simulado/:id/:index', deleteProva);
route.delete('/simulado/:id/:index/:question', deleteQuestao);


route.post('/quiz/register/user', loginRequired, registerInUser, createRoadmap);



module.exports = route;
