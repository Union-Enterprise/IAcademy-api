const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }
})

const LoginModel = mongoose.model('Login', LoginSchema);

class User{
  constructor(body){
    this.body = body;
    this.errors = [];
    this.user = null;
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
    
    this.user = await LoginModel.create(this.body);
    await this.login('auto');
    return this.user;
  }

  check(type){
    if(type === 'signup'){
      if(!this.body.name) this.errors.push('Insira um nome valido.');
    }
    if(!validator.isEmail(this.body.email)) this.errors.push('Insira um e-mail valido.');
    if(this.body.password.length <= 5) this.errors.push('Insira uma senha com mais de 6 caracteres');
  }
  
  async userAlreadyRegistered(){
    return await LoginModel.findOne({ email: this.body.email });
  }

  async login(type){
    if(type !== 'auto') this.check();
    
    if(this.errors.length > 0) return;

    this.user = await LoginModel.findOne({ email: this.body.email });

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
    const user = await LoginModel.findOneAndDelete({ _id: this.body.id, email: this.body.email, name: this.body.name })

    return user;
  }

  async updateName(){
    if(!this.body.name){
      this.errors.push("Insira um nome válido");
      return;
    }
    let user = await LoginModel.findOneAndUpdate({ _id: this.body.id }, { name: this.body.name })
    user = await LoginModel.findOne({ _id: this.body.id }, ["name", "email"]);

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

    let user = await LoginModel.findOneAndUpdate({ _id: this.body.id }, { email: this.body.email })
    user = await LoginModel.findOne({ _id: this.body.id }, ["name", "email"]);

    return user;
  }

  async updatePassword(){
    if(!this.body.password){
      this.errors.push("Insira um senha válida");
      return;
    }
    if(this.body.password.length <= 5){
      this.errors.push('Insira uma senha com mais de 6 caracteres');
      return;
    }

    const salt = bcrypt.genSaltSync();
    this.body.password = bcrypt.hashSync(this.body.password, salt);
    let user = await LoginModel.findOneAndUpdate({ _id: this.body.id }, { password: this.body.password })
    user = await LoginModel.findOne({ _id: this.body.id }, ["name", "email"]);

    return user;
  }
}

module.exports = { User, LoginModel };