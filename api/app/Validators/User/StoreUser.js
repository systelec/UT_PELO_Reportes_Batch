'use strict';

class StoreUser {
  get rules() {
    return {
      email: 'required|unique:users',
      username: 'required|unique:users',
      password: 'required'
    };
  }

  get messages() {
    return {
      'email.required': 'El campo email es requerido.',
      'email.unique': 'El email ya se encuentra registrada.',
      'username.required': 'El campo username es requerido.',
      'username.unique': 'El username ya se encuentra registrada.',
      'password.required': 'El campo password es requerido.'
    };
  }
}

module.exports = StoreUser;
