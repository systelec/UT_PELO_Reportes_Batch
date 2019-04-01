'use strict';

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers');

module.exports = {
  /*
  |--------------------------------------------------------------------------
  | Default Connection
  |--------------------------------------------------------------------------
  |
  | Connection defines the default connection settings to be used while
  | interacting with SQL databases.
  |
  */
  connection: Env.get('DB_CONNECTION', 'sqlite'),

  /*
  |--------------------------------------------------------------------------
  | Sqlite
  |--------------------------------------------------------------------------
  |
  | Sqlite is a flat file database and can be good choice under development
  | environment.
  |
  | npm i --save sqlite3
  |
  */
  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true
  },

  /*
  |--------------------------------------------------------------------------
  | MySQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for MySQL database.
  |
  | npm i --save mysql
  |
  */
  mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | PostgreSQL
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for PostgreSQL database.
  |
  | npm i --save pg
  |
  */
  pg: {
    client: 'pg',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Microsoft SQL Server
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for SQLServer database.
  |
  | npm i --save mssql
  |
  */
  mssql: {
    client: 'mssql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'sa'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Microsoft SQL Server
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for SQLServer database.
  |
  | npm i --save mssql
  |
  */
  wincc1: {
    client: 'mssql',
    connection: {
      host: Env.get('DB_HOST_WINCC1', 'localhost'),
      port: Env.get('DB_PORT_WINCC1', ''),
      user: Env.get('DB_USER_WINCC1', 'sa'),
      password: Env.get('DB_PASSWORD_WINCC1', ''),
      database: Env.get('DB_DATABASE_WINCC1', 'adonis')
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Microsoft SQL Server
  |--------------------------------------------------------------------------
  |
  | Here we define connection settings for SQLServer database.
  |
  | npm i --save mssql
  |
  */
  wincc2: {
    client: 'mssql',
    connection: {
      host: Env.get('DB_HOST_WINCC2', 'localhost'),
      port: Env.get('DB_PORT_WINCC2', ''),
      user: Env.get('DB_USER_WINCC2', 'sa'),
      password: Env.get('DB_PASSWORD_WINCC2', ''),
      database: Env.get('DB_DATABASE_WINCC2', 'adonis')
    }
  }
};
