'use strict';

class UpdateUser {
  get rules() {
    const userId = this.ctx.params.id;
    return {
      email: `unique:users,email,id,${userId}`,
      username: `unique:users,username,id,${userId}`
    };
  }

  get messages() {
    return {
      'email.unique': 'El email ya se encuentra registrada.',
      'username.unique': 'El username ya se encuentra registrada.'
    };
  }
}

module.exports = UpdateUser;
