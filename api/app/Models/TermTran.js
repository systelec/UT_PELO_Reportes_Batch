'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class TermTran extends Model {
  static get createdAtColumn() {
    return null;
  }

  static get updatedAtColumn() {
    return null;
  }

  static get table() {
    return 'TermTrans';
  }

  Batch() {
    return this.belongsTo('App/Models/Batch', 'ROOTGUID', 'OGUID');
  }
}

module.exports = TermTran;
