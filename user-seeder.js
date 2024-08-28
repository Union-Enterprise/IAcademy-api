const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { UserModel } = require('./src/models/User');

require('dotenv').config();

mongoose.connect(process.env.CONNECTIONSTRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUser = async () => { 

  try {
    const existingUser = await UserModel.findOne({ email: process.env.DEFAULT_USER_EMAIL });
    if (existingUser) {
      console.log('usuario teste ja existe');
      return;
    }

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(process.env.DEFAULT_USER_PASSWORD, salt);

    const user = new UserModel({
      name: process.env.DEFAULT_USER_NAME,
      email: process.env.DEFAULT_USER_EMAIL,
      password: hashedPassword,
      nickname: process.env.DEFAULT_USER_NICKNAME,
      is_premium: process.env.DEFAULT_USER_ISPREMIUM
    });

    await user.save();
    console.log('usuario teste criado');
  } catch (error) {
    console.error('erro ao cadastrar usuario teste: ', error);
  } finally {
    mongoose.connection.close();
  }
};

seedUser();
