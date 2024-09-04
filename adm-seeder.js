const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { UserModel } = require('./src/models/User');

require('dotenv').config();

mongoose.connect(process.env.CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedAdm = async () => { 

  try {
    const existingUser = await UserModel.findOne({ email: process.env.DEFAULT_ADM_EMAIL });
    if (existingUser) {
      console.log('usuario adm ja existe');
      return;
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(process.env.DEFAULT_ADM_PASSWORD, salt);

    const user = new UserModel({
      name: process.env.DEFAULT_ADM_NAME,
      email: process.env.DEFAULT_ADM_EMAIL,
      password: hashedPassword,
      nickname: process.env.DEFAULT_ADM_NICKNAME,
      is_premium: process.env.DEFAULT_ADM_ISPREMIUM,
      is_adm: true
    });

    await user.save();
    console.log('usuario adm criado');
  } catch (error) {
    console.error('erro ao cadastrar usuario adm: ', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdm();
