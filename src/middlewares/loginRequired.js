const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/User');

exports.loginRequired = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      errors: ['Login necessário'],
    });
  }

  try {
    const { id } = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await UserModel.findOne({ _id: id });

    if (!user) {
      return res.status(401).json('Usuário inválido');
    }

    req.userId = id;
    req.userEmail = user.email;
    req.userName = user.name;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      errors: ['Token expirado ou inválido'],
    });
  }
};
