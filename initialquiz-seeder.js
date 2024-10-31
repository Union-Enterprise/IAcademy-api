const mongoose = require('mongoose');
const { QuizModel } = require('./src/models/InitialQuiz');

require('dotenv').config();

mongoose.connect(process.env.CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedQuizzes = async () => { 
  try {
    const existingQuizzes = await QuizModel.find();
    if (existingQuizzes.length > 0) {
      console.log('Quizzes já existem');
      return;
    }

    const quizzes = [
      {
        titulo: 'Questão 1',
        questao: 'Um professor aplicou uma prova para 10 alunos e obteve as seguintes notas: 6, 8, 5, 7, 9, 8, 5, 10, 6, 7. Qual é a média aritmética das notas desses alunos?',
        tema: 'Estatística',
      },
      {
        titulo: 'Questão 2',
        questao: 'Calcule a área de um triângulo cuja base mede 10 cm e a altura mede 5 cm.',
        tema: 'Geometria',
      },
      {
        titulo: 'Questão 3',
        questao: 'Considere a função f(x) = 2x + 3. Qual é o valor de f(4)?',
        tema: 'Funções',
      },
      {
        titulo: 'Questão 4',
        questao: 'Um produto custa R$ 200,00 e está com um desconto de 15%. Qual é o preço final do produto após o desconto?',
        tema: 'Porcentagem',
      },
      {
        titulo: 'Questão 5',
        questao: 'Em uma bolsa com 5 bolas vermelhas e 3 bolas azuis, qual é a probabilidade de se retirar uma bola vermelha?',
        tema: 'Probabilidade',
      },
      {
        titulo: 'Questão 6',
        questao: 'Resolva a equação 3x - 7 = 2. Qual é o valor de x?',
        tema: 'Equações',
      },
      {
        titulo: 'Questão 7',
        questao: 'Qual é o resultado da soma 2/5 + 3/10? Apresente a resposta na forma de fração simplificada.',
        tema: 'Números Racionais',
      },
    ];    

    await QuizModel.insertMany(quizzes);
    console.log('quizzes criados');
  } catch (error) {
    console.error('erro ao cadastrar quizzes');
  } finally {
    mongoose.connection.close();
  }
};

seedQuizzes();
