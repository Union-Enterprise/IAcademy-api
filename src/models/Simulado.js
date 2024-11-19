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

  async createSimulado() {
    try {
      this.simulado = await SimuladoModel.create(this.body);
      return this.simulado;
    } catch (err) {
      this.errors.push("Erro na criação de simulado.");
      return;
    }
  }

  async getAllSimulados() {
    return SimuladoModel.find({});
  }

  async getSimulado() {
    return SimuladoModel.findOne({ _id: this.body.id });
  }

  async delSimulado() {
    return SimuladoModel.deleteOne({ _id: this.body.id });
  }

  async delProva() {
    try {
      const simulado = await SimuladoModel.findById(this.body.id);

      if (!simulado) {
        this.errors.push("Simulado não encontrado.");
        return null;
      }

      if (this.body.index < 0 || this.body.index >= simulado.provas.length) {
        this.errors.push("Índice inválido.");
        return null;
      }

      simulado.provas.splice(this.body.index, 1);

      await simulado.save();

      return simulado;
    } catch (err) {
      this.errors.push("Erro ao deletar a prova.");
      console.error(err);
      return null;
    }
  }

  async delQuestao() {
    try {
        const simulado = await SimuladoModel.findById(this.body.id);

        if (!simulado) {
            this.errors.push("Simulado não encontrado.");
            return null;
        }

        if (this.body.index < 0 || this.body.index >= simulado.provas.length) {
            this.errors.push("Índice de prova inválido.");
            return null;
        }

        const prova = simulado.provas[this.body.index];

        if (this.body.question < 0 || this.body.question >= prova.questoes.length) {
            this.errors.push("Índice de questão inválido.");
            return null;
        }

        prova.questoes.splice(this.body.question, 1);

        await simulado.save();

        return simulado;
    } catch (err) {
        this.errors.push("Erro ao deletar a questão.");
        console.error(err);
        return null;
    }
}


}

module.exports = { Simulado, SimuladoModel };