const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    questao: { type: String, required: true },
    tema: { type: String, required: true },
  }, { timestamps: true })
  
const QuizModel = mongoose.model('InitialQuiz', QuizSchema);

class InitialQuiz {
    constructor(body) {
        this.body = body;
        this.quiz = null;
        this.errors = [];
    }

    async create() {
        try {
            this.quiz = await QuizModel.create(this.body);
        } catch (err) {
            this.errors.push("Erro na criação de quiz inicial.");
            return;
        }
    }

    async getQuizes() {
        try {
            this.quiz = await QuizModel.find({});
            return this.quiz;
        } catch (err) {
            this.errors.push("Erro ao buscar quizzes.");
            return null;
        }
    }

    async getQuizById(id) {
        try {
            this.quiz = await QuizModel.findById(id);
            if (!this.quiz) {
                this.errors.push("Quiz não encontrado.");
                return null;
            }
            return this.quiz;
        } catch (err) {
            this.errors.push("Erro ao buscar quiz.");
            return null;
        }
    }

    async delQuiz(id) {
        try {
            this.quiz = await QuizModel.findByIdAndDelete(id);
            if (!this.quiz) {
                this.errors.push("Quiz não encontrado.");
                return null;
            }
            return this.quiz;
        } catch (err) {
            this.errors.push("Erro ao deletar quiz.");
            return null;
        }
    }

    async updateQuiz(id) {
        try {
            this.quiz = await QuizModel.findByIdAndUpdate(id, this.body, { new: true });
            if (!this.quiz) {
                this.errors.push("Quiz não encontrado.");
                return null;
            }
            return this.quiz;
        } catch (err) {
            this.errors.push("Erro ao atualizar quiz.");
            return null;
        }
    }
}

module.exports = { InitialQuiz, QuizModel};
