const InitialQuiz = require('../models/InitialQuiz');

exports.createQuiz = async (req, res) => {
    try {
        const quiz = new InitialQuiz(req.body);
        const newQuiz = await quiz.create();

        if (quiz.errors.length > 0) {
            return res.status(400).json(quiz.errors);
        }

        return res.status(201).json(newQuiz);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao criar o quiz" });
    }
};

exports.getAllQuizzes = async (req, res) => {
    try {
        const quiz = new InitialQuiz();
        const quizzes = await quiz.getQuizes();

        if (quiz.errors.length > 0) {
            return res.status(400).json(quiz.errors);
        }

        return res.status(200).json(quizzes);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao buscar quizzes" });
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const quiz = new InitialQuiz();
        const quizById = await quiz.getQuizById(req.params.id);

        if (quiz.errors.length > 0) {
            return res.status(404).json(quiz.errors);
        }

        return res.status(200).json(quizById);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao buscar quiz" });
    }
};

exports.updateQuiz = async (req, res) => {
    try {
        const quiz = new InitialQuiz(req.body);
        const updatedQuiz = await quiz.updateQuiz(req.params.id);

        if (quiz.errors.length > 0) {
            return res.status(400).json(quiz.errors);
        }

        return res.status(200).json(updatedQuiz);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao atualizar o quiz" });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = new InitialQuiz();
        const deletedQuiz = await quiz.delQuiz(req.params.id);

        if (quiz.errors.length > 0) {
            return res.status(400).json(quiz.errors);
        }

        return res.status(200).json({ message: "Quiz deletado com sucesso" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Erro ao deletar o quiz" });
    }
};

