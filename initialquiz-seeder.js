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
        alternativas: ['6,5', '7,0', '7,1', '7,5'],
        resposta: '7,1',
      },
      {
        titulo: 'Questão 2',
        questao: 'Calcule a área de um triângulo cuja base mede 10 cm e a altura mede 5 cm.',
        tema: 'Geometria',
        alternativas: ['20 cm²', '25 cm²', '30 cm²', '35 cm²'],
        resposta: '25 cm²',
      },
      {
        titulo: 'Questão 3',
        questao: 'Considere a função f(x) = 2x + 3. Qual é o valor de f(4)?',
        tema: 'Funções',
        alternativas: ['9', '10', '11', '12'],
        resposta: '11',
      },
      {
        titulo: 'Questão 4',
        questao: 'Um produto custa R$ 200,00 e está com um desconto de 15%. Qual é o preço final do produto após o desconto?',
        tema: 'Porcentagem',
        alternativas: ['R$ 170,00', 'R$ 160,00', 'R$ 180,00', 'R$ 190,00'],
        resposta: 'R$ 170,00',
      },
      {
        titulo: 'Questão 5',
        questao: 'Em uma bolsa com 5 bolas vermelhas e 3 bolas azuis, qual é a probabilidade de se retirar uma bola vermelha?',
        tema: 'Probabilidade',
        alternativas: ['3/8', '5/8', '1/2', '1/8'],
        resposta: '5/8',
      },
      {
        titulo: 'Questão 6',
        questao: 'Resolva a equação 3x - 7 = 2. Qual é o valor de x?',
        tema: 'Equações',
        alternativas: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        resposta: 'x = 3',
      },
      {
        titulo: 'Questão 7',
        questao: 'Qual é o resultado da soma 2/5 + 3/10? Apresente a resposta na forma de fração simplificada.',
        tema: 'Números Racionais',
        alternativas: ['7/10', '8/10', '9/10', '1'],
        resposta: '7/10',
      },
    ];

    await QuizModel.insertMany(quizzes);
    console.log('quizzes criados');
  } catch (error) {
    console.error('erro ao cadastrar quizzes:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedQuizzes();
