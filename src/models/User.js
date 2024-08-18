const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const { validarCPF } = require('../modules/cpfVerify');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  img: { type: String, default: "" },
  password: { type: String, required: true},
  cpf: { type: String, default: "" },
  links: {
    type: Map,
    of: String,
    default: {}
  },
  is_premium: { type: Boolean, default: false },
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

    if(this.body.password.length <= 7 || !lower || !upper || !number) {
      this.errors.push('Insira uma senha com mais de 8 caracteres, entre eles letras minúsculas, maiúsculas e números');
      return false
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
    }
    if(!validator.isEmail(this.body.email)) this.errors.push('Insira um e-mail valido.');
    this.passwordCheck()
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

  async delete(){
    const user = await UserModel.findOneAndDelete({ _id: this.body.id, email: this.body.email, name: this.body.name }, ["name", "email", "img", "cpf", "links", "is_premium"])

    return user;
  }

  async updateName(){
    if(!this.body.name){
      this.errors.push("Insira um nome válido");
      return;
    }
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { name: this.body.name })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "email", "img", "cpf", "links", "is_premium"]);

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

    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { email: this.body.email })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "email", "img", "cpf", "links", "is_premium"]);

    return user;
  }

  async updatePassword(){
    if(!this.body.password){
      this.errors.push("Insira um senha válida");
      return;
    }
    if(!this.passwordCheck()) return;

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { password: this.body.password })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "email", "img", "cpf", "links", "is_premium"]);

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
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "email", "img", "cpf", "links", "is_premium"]);

    return user;
  }

  async updateIMG(){
    let user = await UserModel.findOneAndUpdate({ _id: this.body.id }, { img: this.body.img })
    user = await UserModel.findOne({ _id: this.body.id }, ["name", "email", "img", "cpf", "links", "is_premium"]);

    return user;
  }

  async getUser(){
    return await UserModel.findOne({ _id: this.body.id }, ["name", "email", "img", "cpf", "links", "is_premium"]);
  }
}

module.exports = { User, UserModel };