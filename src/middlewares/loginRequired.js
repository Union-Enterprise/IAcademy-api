const jwt = require('jsonwebtoken');
const { LoginModel } = require('../models/User');

exports.loginRequired = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: ['Login necessário'],
    });
  }

  const [, token] = authorization.split(' ');

  try {
    const { id, email } = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await LoginModel.findOne({ _id: id, email: email });

    if (!user) {
      return res.status(401).json('Usuario inválido');
    }

    req.userId = id;
    req.userEmail = email;
    req.userName = user.name;
    next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({
      errors: ['Token expirado ou invalido'],
    });
  }
};