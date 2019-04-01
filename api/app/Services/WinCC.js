'use strict';

const Database = use('Database');
const moment = require('moment');
const Archive = use('App/Models/Archive');

class WinCC {
  async getHistoricos(variables, desde, hasta) {
    try {
      let server = await Database.connection('wincc1')
        .table('WinCCProjects')
        .first();

      let conection = 'wincc1';
      let osbasv = 'OSBASV1\\WINCC';

      if (server.RedundancyState !== 'RSE_MASTER' || !server) {
        server = await Database.connection('wincc2')
          .table('WinCCProjects')
          .first();
        conection = 'wincc2';
        osbasv = 'OSBASV2\\WINCC';

        if (server.RedundancyState !== 'RSE_MASTER' || !server) {
          server = null;
        }
      }

      if (server) {
        let tags = await Database.connection(conection).raw(
          `SELECT ValueID FROM [${osbasv}].[${
            server.DatabaseName
          }R].[dbo].[Archive] WHERE ValueName IN (${variables})`
        );
        tags = tags.map(tag => tag.ValueID).join(';');

        const historicos = await Database.connection(conection).raw(
          `SELECT ValueID, Timestamp, RealValue FROM OPENQUERY(LnkRtDB_WinCCOLEDB, 'TAG:R,(${tags}),${desde},${hasta}') WHERE Quality = 128`
        );

        return historicos;
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

module.exports = WinCC;
