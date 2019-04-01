'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ArchiveSchema extends Schema {
  up() {
    this.create('Archive', table => {
      table.string('Parametro');
      table.string('Tag');
      table.string('Tacnologia');
      table.string('Equipo');
      table.boolean('Exportar').defaultTo(false);
    });
  }

  down() {
    this.drop('Archive');
  }
}

module.exports = ArchiveSchema;
