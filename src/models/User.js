const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { validarCPF } = require('../modules/cpfVerify');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String, default: "", unique: true },
  googleId: { type: String, default: "" },
  facebookId: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" },
  nascimento: { type: Date, default: "" },
  telefone: { type: String, default: "" },
  img: { type: String, default: "" },
  cpf: { type: String, default: "" },
  genero: { type: String, default: "" },
  links: {
    type: Map,
    of: String,
    default: {}
  },
  is_premium: { type: Boolean, default: false },
  rua: { type: String, default: "" },
  cep: { type: String, default: "" },
  bairro: { type: String, default: "" },
  cidade: { type: String, default: "" },
  numero: { type: String, default: "" },
  complemento: { type: String, default: "" },
  estado: { type: String, default: "" },
  cartoes: {
    type: Map,
    of: String,
    default: {
      "numero": "",
      "nome": "",
      "validade": "",
      "cvv": ""
    }
  },
  passwordResetToken: { type: String, default: "" },
  passwordResetExpires: { type: Date, default: "" },
  is_adm: { type: Boolean, default: false },
  is_banned: { type: Boolean, default: false },
}, { timestamps: true })

const UserModel = mongoose.model('User', UserSchema);

class User {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  passwordCheck() {
    const lower = /[a-z]/.test(this.body.password);
    const upper = /[A-Z]/.test(this.body.password);
    const number = /\d/.test(this.body.password);
    const length = (this.body.password).length;

    if (length <= 7 || !lower || !upper || !number) {
      this.errors.push('Insira uma senha com mais de 8 caracteres, entre eles letras minúsculas, maiúsculas e números');
      return false
    } else {
      return true
    }
  }

  async register() {
    this.check('signup');
    if (this.errors.length > 0) return;

    if (await this.userAlreadyRegistered(this.body)) {
      this.errors.push('Usuario já existe.');
      return;
    };

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    this.user = await UserModel.create(this.body);
    return this.user;
  }

  check(type) {
    if (type === 'signup') {
      if (!this.body.name) this.errors.push('Insira um nome valido.');
      this.passwordCheck()
    }
    if (!validator.isEmail(this.body.email)) this.errors.push('Insira um e-mail valido.');
  }

  async userAlreadyRegistered() {
    return await UserModel.findOne({ email: this.body.email });
  }

  async login(type) {
    if (type !== 'auto') this.check();

    if (this.errors.length > 0) return;
    try {
      this.user = await UserModel.findOne({ email: this.body.email });

      if (this.user === null) {
        this.errors.push('O e-mail ou a senha está incorreto.');
        return;
      }
      if ((!this.user.is_adm && this.body.type == "adm") || (this.user.is_adm && !this.body.type)
        || (!this.user)
        || (!bcrypt.compareSync(this.body.password, this.user.password) && this.body.password !== this.user.password)
        || this.user.is_banned) {
        this.errors.push('O e-mail ou a senha está incorreto.');
        return;
      }
      return this.user;
    } catch (err) {
      console.log(err);
    }
  }

  async comparePassword(oldPassword) {
    this.user = await UserModel.findOne({ _id: this.body.id }, ["password"])
    if (!bcrypt.compareSync(oldPassword, this.user.password) && oldPassword !== this.user.password) {
      this.errors.push("A senha está incorreta.");
      return false;
    } else {
      return true;
    }
  }

  async delete() {
    const user = await UserModel.findOneAndUpdate(
      { _id: this.body.id, email: this.body.email, name: this.body.name },
      { $set: { is_banned: true } },
      { new: true, fields: ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"] }
    );
  
    return user;
  }
  async updateName() {
    if (!this.body.name) {
      this.errors.push("Insira um nome válido");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { name: this.body.name })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateEmail() {
    if (!validator.isEmail(this.body.email)) {
      this.errors.push("Insira um email válido");
      return;
    }

    if (await this.userAlreadyRegistered(this.body)) {
      this.errors.push("Esse email já está em uso");
      return;
    }

    if (await UserModel.findOne({ _id: this.body.id, googleId: { $exists: true, $ne: "" } })) {
      this.errors.push("Não é possivel alterar email que está vinculado a uma conta Google.");
      return;
    }

    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { email: this.body.email })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updatePassword() {
    if (!this.body.password) {
      this.errors.push("Insira um senha válida");
      return;
    }
    if (!this.passwordCheck()) {
      this.errors.push("Insira uma senha com mais de 8 caracteres, entre eles letras minúsculas, maiúsculas e números");
      return;
    }
    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { password: this.body.password })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateCPF() {
    let user = await UserModel.findOne({ _id: this.body.id });
    if (user.cpf) {
      this.errors.push("CPF não pode ser alterado");
      return;
    }
    if (!validarCPF(this.body.cpf)) {
      this.errors.push("Insira um cpf válido");
      return;
    }
    user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { cpf: this.body.cpf })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateGender() {
    if (!this.body.genero) {
      this.errors.push("Insira um gênero");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { genero: this.body.genero })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateAddress() {
    if (!this.body.cep) {
      this.errors.push("Insira um endereço");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { cep: this.body.cep, rua: this.body.rua, numero: this.body.numero, bairro: this.body.bairro, cidade: this.body.cidade, estado: this.body.estado })
    if (this.body.complemento != "") {
      user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { complemento: this.body.complemento });
    }
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt", "cep", "rua", "numero", "bairro", "cidade", "complemento", "estado"]);

    return user;
  }

  async updateBirth() {
    if (!this.body.nascimento) {
      this.errors.push("Insira uma data de nascimento");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { nascimento: this.body.nascimento })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updatePhone() {
    if (!this.body.telefone) {
      this.errors.push("Insira um número de telefone");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { telefone: this.body.telefone })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateIMG() {
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { img: `http://localhost:5002/files/` + this.body.img })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async getUser() {
    return await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "email", "googleId", "nascimento", "telefone", "img", "cpf", "genero", "links", "is_premium", "cep", "rua", "bairro", "cidade", "numero", "complemento", "estado", "is_adm", "createdAt"]);
  }

  async forgotPassword(email, token, now) {
    const user = await UserModel.findOne({ email });

    await UserModel.findOneAndUpdate({ email }, { passwordResetToken: token, passwordResetExpires: now })

    const userUp = await UserModel.findOne({ email });

    return user;
  }

  async verifyToken(token) {
    this.user = await UserModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push('Email não encontrado');
      return;
    }

    if (token !== this.user.passwordResetToken) {
      this.errors.push('Token invalido')
      return;
    }

    const now = new Date();

    if (now > this.user.passwordResetExpires) {
      this.errors.push('Token expirado, gere um novo.');
      return;
    }

    return true;
  }

  async resetPassword(token, password) {
    this.user = await UserModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push('Email não encontrado');
      return;
    }

    if (token !== this.user.passwordResetToken) {
      this.errors.push('Token invalido')
      return;
    }

    const now = new Date();

    if (now > this.user.passwordResetExpires) {
      this.errors.push('Token expirado, gere um novo.');
      return;
    }

    if (!password) {
      this.errors.push("Insira um senha válida");
      return;
    }
    this.body.password = password;
    if (!this.passwordCheck()) {
      this.errors.push("Insira uma senha com mais de 8 caracteres, entre eles letras minúsculas, maiúsculas e números");
      return;
    }
    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(password, salt);

    await UserModel.findByIdAndUpdate(this.user._id, { password: this.body.password })

    const user = await UserModel.findById(this.user._id, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);
    await UserModel.findByIdAndUpdate(this.user._id, { passwordResetToken: "", passwordResetExpires: "" })

    return user;
  }

  async getRecentUsersADM(qtd) {
    try {
      let recentUsers;
      if (qtd) {
        recentUsers = await UserModel.find({ $or: [{ is_adm: { $exists: false } }, { is_adm: false }] })
          .sort({ createdAt: -1 })
          .limit(qtd)
          .select('name nickname email img is_adm is_premium is_banned');
      } else {
        recentUsers = await UserModel.find({ $or: [{ is_adm: { $exists: false } }, { is_adm: false }] })
          .sort({ createdAt: -1 })
          .select('name nickname email img is_adm is_premium is_banned');
      }

      return recentUsers;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async usersByMonth() {
    try {
      const usersPerMonth = await UserModel.aggregate([
        {
          $match: {
            $or: [
              { is_adm: { $exists: false } },
              { is_adm: false }
            ]
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            "_id.year": 2024
          }
        },
        {
          $sort: {
            "_id.month": 1
          }
        }
      ]);
      return usersPerMonth;
    } catch (error) {
      console.error('Erro ao buscar usuários por mês:', error);
      throw error;
    }
  }

  async usersTotal() {
    try {
      const summary = await UserModel.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            premiumUsers: [{ $match: { is_premium: true } }, { $count: "count" }],
            nonPremiumUsers: [{ $match: { is_premium: false } }, { $count: "count" }],
            bannedUsers: [{ $match: { is_banned: true } }, { $count: "count" }],
            notBannedUsers: [{ $match: { is_banned: false } }, { $count: "count" }],
            adminUsers: [{ $match: { is_adm: true } }, { $count: "count" }],
            commonUsers: [{ $match: { is_adm: false } }, { $count: "count" }]
          }
        },
        {
          $project: {
            totalUsers: { $arrayElemAt: ["$totalUsers.count", 0] },
            premiumUsers: { $arrayElemAt: ["$premiumUsers.count", 0] },
            nonPremiumUsers: { $arrayElemAt: ["$nonPremiumUsers.count", 0] },
            bannedUsers: { $arrayElemAt: ["$bannedUsers.count", 0] },
            notBannedUsers: { $arrayElemAt: ["$notBannedUsers.count", 0] },
            adminUsers: { $arrayElemAt: ["$adminUsers.count", 0] },
            commonUsers: { $arrayElemAt: ["$commonUsers.count", 0] }
          }
        }
      ]);

      return summary[0] || {
        totalUsers: 0,
        premiumUsers: 0,
        nonPremiumUsers: 0,
        bannedUsers: 0,
        notBannedUsers: 0,
        adminUsers: 0,
        commonUsers: 0
      };
    } catch (error) {
      console.log("Erro ao buscar quantidade de usuarios", error);
      throw error;
    }
  };


  async getUsersADM(category, plan, status) {
    let filter = {};

    if (category) {
      filter.is_adm = category === "admin";
    }
    if (plan) {
      filter.is_premium = plan === "premium";
    }
    if (status) {
      filter.is_banned = status === "sus";
    }
  
    try {
      const users = await UserModel.find(filter)
        .select('name nickname email img is_adm is_premium is_banned');
      
      return users;
    } catch (error) {
      console.log("Erro ao buscar usuários", error);
      this.errors.push('Erro ao buscar usuarios')
      return;

    }

  
  //   try {
  //     const users = await UserModel.find({})
  //       .sort({ createdAt: -1 })
  //       .select('name nickname email img is_adm is_premium is_banned');

  //     return users;
  //   } catch (err) {
  //     console.log(err);
  //     this.errors.push('Não foi possivel buscar usuários.');
  //     return;
  //   }
  // }
  }

  async getUsersBySearch(search){
    try{
      const regex = new RegExp(search, 'i');
      const users = await UserModel.find({name: regex})
      .select('name nickname email img is_adm is_premium is_banned');
      return users;
    } catch (error) {
      console.log("Erro durante a busca", error);
      this.errors.push("Erro durante a busca")
      return;
    }
  }

  async createADM(){
    this.check('signup');
    if (this.errors.length > 0) return;

    if (await this.userAlreadyRegistered(this.body)) {
      this.errors.push('Usuario já existe.');
      return;
    };

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    this.body.is_adm = true;
    this.body.is_premium = true;
    this.user = await UserModel.create(this.body);
    return this.user;
  }

  async createUserAdmin(){
    this.check('signup');
    if (this.errors.length > 0) return;

    if (await this.userAlreadyRegistered(this.body)) {
      this.errors.push('Usuario já existe.');
      return;
    };

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    this.user = await UserModel.create(this.body);
    return this.user;
  }

  async restore() {
    const user = await UserModel.findOneAndUpdate(
      { email: this.body.email },
      { $set: { is_banned: false } },
      { new: true, fields: ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"] }
    );
  
    return user;
  }

  async ban(){
    const user = await UserModel.findOneAndUpdate(
      { email: this.body.email },
      { $set: { is_banned: true } },
      { new: true, fields: ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"] }
    );  
    return user;
  }

}

module.exports = { User, UserModel };