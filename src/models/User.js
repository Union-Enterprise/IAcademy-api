const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { validarCPF } = require('../modules/cpfVerify');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nickname: { type: String, default: "", unique: true },
  googleId: { type: String },
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
  passwordResetExpires: { type: Date, default: "" }
}, { timestamps: true })

const UserModel = mongoose.model('User', UserSchema);

class User{
  constructor(body){
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  passwordCheck(){
    const lower = /[a-z]/.test(this.body.password);
    const upper = /[A-Z]/.test(this.body.password);
    const number = /\d/.test(this.body.password);
    const length = (this.body.password).length;

    if(length <= 7 || !lower || !upper || !number) {
      this.errors.push('Insira uma senha com mais de 8 caracteres, entre eles letras minúsculas, maiúsculas e números');
      return false
    } else {
      return true
    }
    
  }

  async register(){
    this.check('signup');
    if(this.errors.length > 0) return;

    if(await this.userAlreadyRegistered(this.body)){
      this.errors.push('Usuario já existe.');
      return;
    };

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    this.user = await UserModel.create(this.body);
    return this.user;
  }

  check(type){
    if(type === 'signup'){
      if(!this.body.name) this.errors.push('Insira um nome valido.');
      this.passwordCheck()
    }
    if(!validator.isEmail(this.body.email)) this.errors.push('Insira um e-mail valido.');
  }
  
  async userAlreadyRegistered(){
    return await UserModel.findOne({ email: this.body.email });
  }

  async login(type){
    if(type !== 'auto') this.check();
    
    if(this.errors.length > 0) return;

    this.user = await UserModel.findOne({ email: this.body.email });

    if(!this.user){
      this.errors.push('O e-mail ou a senha está incorreto.');
      return;
    }

    if(!bcrypt.compareSync(this.body.password, this.user.password) && this.body.password !== this.user.password){
      this.errors.push('O e-mail ou a senha está incorreto.');
      this.user = null;
      return;
    }
    
    return this.user;
  }
  
  async comparePassword(oldPassword){
    this.user = await UserModel.findOne({_id: this.body.id}, ["password"])
    if(!bcrypt.compareSync(oldPassword, this.user.password) && oldPassword !== this.user.password){
      this.errors.push("A senha está incorreta.");
      return false;
    }else {
      return true;
    }
  }
  
  async delete(){
    const user = await UserModel.findOneAndDelete({ _id: this.body.id, email: this.body.email, name: this.body.name }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"])
    
    return user;
  }

  async updateName(){
    if(!this.body.name){
      this.errors.push("Insira um nome válido");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { name: this.body.name })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateEmail(){
    if(!validator.isEmail(this.body.email)){
      this.errors.push("Insira um email válido");
      return;
    }

    if(await this.userAlreadyRegistered(this.body)){
      this.errors.push("Esse email já está em uso");
      return;
    }

    if(await UserModel.findOne({ _id: this.body.id }, ['googleId'])){
      this.errors.push("Não é possivel alterar email que está vinculado a uma conta Google.");
      return;
    }

    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { email: this.body.email })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updatePassword(){
    if(!this.body.password){
      this.errors.push("Insira um senha válida");
      return;
    }
    if(!this.passwordCheck()){
      this.errors.push("Insira uma senha com mais de 8 caracteres, entre eles letras minúsculas, maiúsculas e números");
      return;
    } 
    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { password: this.body.password })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateCPF(){
    let user = await UserModel.findOne({ _id: this.body.id });
    if(user.cpf){
      this.errors.push("CPF não pode ser alterado");
      return;
    }
    if(!validarCPF(this.body.cpf)){
      this.errors.push("Insira um cpf válido");
      return;
    }
    user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { cpf: this.body.cpf })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async updateIMG(){
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { img: `http://localhost:5002/files/`+this.body.img })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);

    return user;
  }

  async getUser(){
    return await UserModel.findOne({ _id: this.body.id }, ["name", "nickname", "nascimento", "email", "img", "cpf", "links", "is_premium", "createdAt"]);
  }

  async forgotPassword(email, token, now){
    const user = await UserModel.findOne({ email });

    await UserModel.findOneAndUpdate({ email }, { passwordResetToken: token, passwordResetExpires: now })

    const userUp = await UserModel.findOne({ email });

    return user;
  }

  async verifyToken(token){
    this.user = await UserModel.findOne({ email: this.body.email });

    if(!this.user){
      this.errors.push('Email não encontrado');
      return;
    }

    if(token !== this.user.passwordResetToken){
      this.errors.push('Token invalido')
      return;
    }

    const now = new Date();

    if(now > this.user.passwordResetExpires){
      this.errors.push('Token expirado, gere um novo.');
      return;
    }

    return true;
  }

  async resetPassword(token, password){
    this.user = await UserModel.findOne({ email: this.body.email });

    if(!this.user){
      this.errors.push('Email não encontrado');
      return;
    }

    if(token !== this.user.passwordResetToken){
      this.errors.push('Token invalido')
      return;
    }

    const now = new Date();

    if(now > this.user.passwordResetExpires){
      this.errors.push('Token expirado, gere um novo.');
      return;
    }

    if(!password){
      this.errors.push("Insira um senha válida");
      return;
    }
    this.body.password = password;
    if(!this.passwordCheck()){
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
}

module.exports = { User, UserModel };