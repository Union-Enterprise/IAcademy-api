const mongoose = require('mongoose');

const questaoSchema = new mongoose.Schema({
  titulo: {
    type: String
  },
  enunciado: {
    type: String
  },
  alternativas: {
    type: [String] 
  },
  alternativaCorreta: {
    type: String 
  },
  explicacao: {
    type: String 
  },
  habilidade: {
    type: String
  }
});

const provaSchema = new mongoose.Schema({
  titulo: {
    type: String
  },
  tema: {
    type: String
  },
  desc: {
    type: String 
  },
  questoes: [questaoSchema] 
});

const simuladoSchema = new mongoose.Schema({
  titulo: {
    type: String, 
    default: ""
  },
  desc: {
    type: String,
    default: "" 
  },
  provas: [provaSchema]
});

const SimuladoModel = mongoose.model('Simulado', simuladoSchema)

class Simulado {
    constructor(body) {
        this.body = body;
        this.simulado = null;
        this.errors = [];
    }

    async createSimulado(){
        try {
            this.simulado = await SimuladoModel.create(this.body);
            return this.simulado;
        } catch (err) {
            this.errors.push("Erro na criação de simulado.");
            return;
        }
    }

    async getAllSimulados(){
      return SimuladoModel.find({});
    }

    async getSimulado(){
      return SimuladoModel.findOne({ _id: this.body.id});
    }
}

module.exports = {Simulado, SimuladoModel};