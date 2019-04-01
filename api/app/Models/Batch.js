'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Batch extends Model {
  static get createdAtColumn() {
    return null;
  }

  static get updatedAtColumn() {
    return null;
  }

  static get table() {
    return 'Batch';
  }

  TermTrans() {
    return this.hasMany('App/Models/TermTran', 'OGUID', 'ROOTGUID');
  }
}

module.exports = Batch;
