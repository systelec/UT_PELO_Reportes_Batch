'use strict';

const TermTran = use('App/Models/TermTran');
const Batch = use('App/Models/Batch');
const OnlineParameterValue = use('App/Models/OnlineParameterValue');
const Database = use('Database');
const moment = use('moment');
const _ = require('lodash');
const Ws = use('Ws');
const Socket = require('../../Services/Socket');

class TermTranController {
  async index({ request, response }) {
    let { page, sortBy, descending, perPage, groupBy, filter } = request.get();
    page = page || 1;
    sortBy = sortBy || 'Start';
    descending = descending || 'ASC';
    perPage = perPage || 10;
    filter = filter
      ? JSON.parse(filter)
      : {
          Name: [],
          Batch: [],
          UnitName: [],
          ProductName: [],
          ProductCode: [],
          Start: null,
          End: null
        };

    const Start = new Date(
      moment()
        .add(-7, 'days')
        .format('YYYY-MM-DD')
    );

    const End = new Date(moment().format('YYYY-MM-DD'));

    let ROOTGUID = [];
    const queryBatch = Batch.query().select('OGUID');

    if (filter.Batch.length > 0 || filter.ProductName.length > 0 || filter.ProductCode.length > 0) {
      if (filter.Batch.length > 0) {
        queryBatch.whereIn('Name', filter.Batch);
      }

      if (filter.ProductName.length > 0) {
        queryBatch.whereIn('ProductName', filter.ProductName);
      }

      if (filter.ProductCode.length > 0) {
        queryBatch.whereIn('ProductCode', filter.ProductCode);
      }
      ROOTGUID = await queryBatch.fetch();
      ROOTGUID = ROOTGUID.toJSON();
      ROOTGUID = ROOTGUID.map(item => item.OGUID);
    }

    let termTrans = [];
    const query = TermTran.query();

    if (groupBy) {
      query
        .select(groupBy)
        .groupBy(groupBy)
        .orderBy(groupBy, 'ASC');

      termTrans = await query.fetch();
    } else {
      let data = [];

      query
        .select(
          'Name',
          'Description',
          'UnitName',
          'Start',
          'End',
          'DataDescription',
          'OBJID',
          'POBJID',
          'ROOTGUID'
        )
        .whereNotNull('Start');

      if (filter.Start) {
        query.where('Start', '>', filter.Start);
      } else {
        query.where('Start', '>', Start);
      }

      if (filter.End) {
        query.where('End', '<', filter.End);
      } else {
        query.where('End', '<', End);
      }

      if (filter.Name.length > 0) {
        query.whereIn('Name', filter.Name);
      }

      if (ROOTGUID.length > 0) {
        query.whereIn('ROOTGUID', ROOTGUID);
      }

      termTrans = await query.orderBy(sortBy, descending).paginate(page, perPage);
      termTrans = termTrans.toJSON();

      for (const termtran of termTrans.data) {
        const item = termtran;
        item.OnlineParameterValue = await OnlineParameterValue.query()
          .select('Name', 'UoMName', 'sp_float', 'av_float', 'sp_int', 'asp_int')
          .where('POBJID', termtran.OBJID)
          .where('P2OBJID', termtran.POBJID)
          .where('ROOTGUID', termtran.ROOTGUID)
          .fetch();

        item.Batch = await Batch.query()
          .select('Name', 'ProductCode', 'ProductName', 'MRecipeName', 'ActEnd')
          .where('OGUID', termtran.ROOTGUID)
          .first();

        data.push(item);
      }
      termTrans.data = data;
    }

    response.status(200).json(termTrans);
  }

  async show({ request, response, params: { id } }) {
    const termTran = await TermTran.findOrFail(id);

    if (!termTran) {
      response.status(404).json({
        message: 'TermTran no encontrada.',
        id
      });
      return;
    }
    response.status(200).json(termTran);
  }

  async exportarListadoTermTransCSV({ request, response }) {
    let { filter } = request.get();

    filter = filter
      ? JSON.parse(filter)
      : {
          Name: [],
          Batch: [],
          UnitName: [],
          ProductName: [],
          ProductCode: [],
          Start: null,
          End: null
        };

    const Start =
      filter.Start ||
      new Date(
        moment()
          .add(-7, 'days')
          .format('YYYY-MM-DD')
      );
    const End = filter.End || new Date(moment().format('YYYY-MM-DD'));

    let termTrans = [];
    const query = TermTran.query();
    let data = [];

    query
      .select(
        'Batch.ProductName',
        'Batch.ProductCode',
        'TermTrans.Name',
        'TermTrans.Description',
        'TermTrans.UnitName',
        'TermTrans.Start',
        'TermTrans.End',
        'TermTrans.DataDescription',
        'OnlineParameterValue.Name as Parameter',
        'OnlineParameterValue.UoMName',
        'OnlineParameterValue.sp_float',
        'OnlineParameterValue.av_float',
        'OnlineParameterValue.sp_int',
        'OnlineParameterValue.asp_int'
      )
      .innerJoin('Batch', function() {
        this.on('TermTrans.ROOTGUID', 'Batch.OGUID')
          .on('TermTrans.POBJID', 'Batch.OBJID')
          .on('TermTrans.POTID', 'Batch.OTID');
      })
      .innerJoin('OnlineParameterValue', function() {
        this.on('TermTrans.ROOTGUID', 'OnlineParameterValue.ROOTGUID')
          .on('TermTrans.OBJID', 'OnlineParameterValue.POBJID')
          .on('TermTrans.OTID', 'OnlineParameterValue.POTID')
          .on('Batch.OBJID', 'OnlineParameterValue.P2OBJID')
          .on('Batch.OTID', 'OnlineParameterValue.P2OTID');
      })
      .whereNotNull('Start')
      .where('Start', '>', Start)
      .where('End', '<', End);

    if (filter.Name.length > 0) {
      query.whereIn('Name', filter.Name);
    }

    if (filter.Batch.length > 0) {
      query.whereIn('Batch.Name', filter.Batch);
    }

    if (filter.ProductName.length > 0) {
      query.whereIn('Batch.ProductName', filter.ProductName);
    }

    if (filter.ProductCode.length > 0) {
      query.whereIn('Batch.ProductCode', filter.ProductCode);
    }

    termTrans = await query.orderBy('TermTrans.Start', 'DESC').fetch();
    termTrans = termTrans.toJSON();
    response.status(200).json(termTrans);

    // for (const termtran of termTrans) {
    //   const item = termtran;
    //   item.OnlineParameterValue = await OnlineParameterValue.query()
    //     .select('Name', 'UoMName', 'sp_float', 'av_float', 'sp_int', 'asp_int')
    //     .where('POBJID', termtran.OBJID)
    //     .where('P2OBJID', termtran.POBJID)
    //     .where('ROOTGUID', termtran.ROOTGUID)
    //     .fetch();

    //   item.Batch = await Batch.query()
    //     .select('Name', 'ProductCode', 'ProductName', 'MRecipeName', 'ActEnd')
    //     .where('OGUID', termtran.ROOTGUID)
    //     .first();

    //   data.push(item);
    // }

    // response.status(200).json(data);

    // const fields = [
    //   'Nombre',
    //   'Producto',
    //   'Codigo',
    //   'Tecnologia',
    //   'Reactor',
    //   'Inicio',
    //   'Fin',
    //   'Duracion'
    // ];
    // const opts = { fields };
    // const csv = parse(batchs, opts);

    // response.header('Content-type', 'text/csv');
    // response.header('Content-Disposition', 'attachment; filename="lotes.csv"');
    // response.send(csv);
  }
}

module.exports = TermTranController;
