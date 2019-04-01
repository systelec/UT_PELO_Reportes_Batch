'use strict';

const Batch = use('App/Models/Batch');
const TermTran = use('App/Models/TermTran');
const CdvMessage = use('App/Models/CdvMessage');
const OnlineParameterValue = use('App/Models/OnlineParameterValue');
const Database = use('Database');
const moment = use('moment');
const mathjs = use('mathjs');
const _ = require('lodash');
const Ws = use('Ws');
const Socket = require('../../Services/Socket');
const Archive = use('App/Models/Archive');
const WinCC = require('../../Services/WinCC');
const { parse } = require('json2csv');

class BatchController {
  async index({ request, response }) {
    let { page, sortBy, descending, perPage, filter, groupBy, groupData } = request.get();
    page = page || 1;
    sortBy = sortBy || 'ActStart';
    descending = descending || 'ASC';
    perPage = perPage || 10;
    groupData = groupData ? JSON.parse(groupData) : ['ProductName', 'ProductCode'];
    filter = filter
      ? JSON.parse(filter)
      : {
          Name: null,
          MRecipeName: [],
          ProductName: [],
          ProductCode: [],
          ActStart: null,
          ActEnd: null
        };

    const ActStart =
      filter.ActStart ||
      new Date(
        moment()
          .add(-7, 'days')
          .format('YYYY-MM-DD')
      );
    const ActEnd = filter.ActEnd || new Date(moment().format('YYYY-MM-DD'));

    let batchs = null;
    const query = Batch.query();

    if (groupBy) {
      query
        .select(groupBy)
        .groupBy(groupBy)
        .orderBy(groupBy, 'ASC');

      batchs = await query.fetch();
    } else {
      query
        .select(
          'OGUID',
          'Name',
          'Quantity',
          'ProductName',
          'ProductCode',
          'MRecipeName',
          'MRecipeVersion',
          'ActStart',
          'ActEnd',
          'State'
        )
        .with('TermTrans', builder => {
          builder.orderBy('Start', 'ASC');
        })
        .where('ActStart', '>', ActStart)
        .where('ActEnd', '<', ActEnd);

      if (filter.Name) {
        query.where('Name', 'like', `%${filter.Name}%`);
      }

      if (filter.MRecipeName.length > 0) {
        query.whereIn('MRecipeName', filter.MRecipeName);
      }

      if (filter.ProductName.length > 0) {
        query.whereIn('ProductName', filter.ProductName);
      }

      if (filter.ProductCode.length > 0) {
        query.whereIn('ProductCode', filter.ProductCode);
      }

      batchs = await query.orderBy(sortBy, descending).paginate(page, perPage);
      batchs = batchs.toJSON();
    }

    let groupDataTotal = {};
    if (groupData) {
      for (const data of groupData) {
        const queryGroup = Batch.query();
        queryGroup
          .select(data)
          .where('ActStart', '>', ActStart)
          .where('ActEnd', '<', ActEnd);

        if (filter.Name) {
          queryGroup.where('Name', 'like', `%${filter.Name}%`);
        }

        if (filter.MRecipeName.length > 0) {
          queryGroup.whereIn('MRecipeName', filter.MRecipeName);
        }

        if (filter.ProductName.length > 0) {
          queryGroup.whereIn('ProductName', filter.ProductName);
        }

        if (filter.ProductCode.length > 0) {
          queryGroup.whereIn('ProductCode', filter.ProductCode);
        }

        let dataGroup = await queryGroup
          .groupBy(data)
          .orderBy(data, 'ASC')
          .fetch();
        dataGroup = dataGroup.toJSON();
        dataGroup = dataGroup.map(item => item[data]);
        groupDataTotal[data] = dataGroup;
      }
    }
    batchs.groupData = groupDataTotal;

    response.status(200).json(batchs);
  }

  async show({ request, response, params: { id } }) {
    const batch = await Batch.findOrFail(id);

    if (!batch) {
      response.status(404).json({
        message: 'Batch no encontrada.',
        id
      });
      return;
    }
    response.status(200).json(batch);
  }

  async listaCampoAgrupado({ request, response }) {
    let { groupBy } = request.get();

    response.status(200).json(batchsAgrupados);
  }

  async indexTermTrans({ request, response, params: { id } }) {
    let termTrans = await TermTran.query()
      .select(
        'TermTrans.Name as Name',
        'TermTrans.Description',
        'TermTrans.UnitName',
        'TermTrans.Start',
        'TermTrans.End',
        'TermTrans.DataDescription',
        'TermTrans.OBJID',
        'TermTrans.POBJID',
        'TermTrans.ROOTGUID',
        'OnlineParameterValue.Name as NameParameter',
        'OnlineParameterValue.UoMName as UoMName',
        'OnlineParameterValue.sp_float as sp_float',
        'OnlineParameterValue.av_float as av_float',
        'OnlineParameterValue.sp_int as sp_int',
        'OnlineParameterValue.asp_int as asp_int'
      )
      .innerJoin('OnlineParameterValue', function() {
        this.on('TermTrans.ROOTGUID', 'OnlineParameterValue.ROOTGUID')
          .on('TermTrans.OBJID', 'OnlineParameterValue.POBJID')
          .on('TermTrans.POBJID', 'OnlineParameterValue.P2OBJID');
      })
      .whereNotNull('Start')
      .where('TermTrans.ROOTGUID', id)
      .fetch();
    termTrans = termTrans.toJSON();

    const termTransGroupByStart = _.groupBy(termTrans, 'Start');

    let data = [];
    for (const key in termTransGroupByStart) {
      let i = 0;
      if (termTransGroupByStart[key].length > 0) {
        let termTran = {
          Name: termTransGroupByStart[key][0].Name,
          Description: termTransGroupByStart[key][0].Description,
          UnitName: termTransGroupByStart[key][0].UnitName,
          Start: termTransGroupByStart[key][0].Start,
          End: termTransGroupByStart[key][0].End,
          DataDescription: termTransGroupByStart[key][0].DataDescription,
          OBJID: termTransGroupByStart[key][0].OBJID,
          POBJID: termTransGroupByStart[key][0].POBJID,
          ROOTGUID: termTransGroupByStart[key][0].ROOTGUID
        };

        let OnlineParameterValue = termTransGroupByStart[key].map(item => {
          return {
            Name: item.NameParameter,
            UoMName: item.UoMName,
            sp_float: item.sp_float,
            av_float: item.av_float,
            sp_int: item.sp_int,
            asp_int: item.asp_int
          };
        });

        termTran.OnlineParameterValue = OnlineParameterValue;

        data.push(termTran);
      }
    }

    response.status(200).json(data);
  }

  async indexCDVMessage({ request, response, params: { id } }) {
    let cdvMessage = await CdvMessage.query()
      .select('TimeStamp', 'OS_Server', 'Origin', 'Message', 'Area')
      .where('ROOTGUID', id)
      .orderBy('TimeStamp', 'ASC')
      .fetch();
    cdvMessage = cdvMessage.toJSON();

    response.status(200).json(cdvMessage);
  }

  async exportarCSV({ request, response, params: { id } }) {
    const batch = await Batch.query()
      .where('OGUID', id)
      .first();

    let equipo = await TermTran.query()
      .where('ROOTGUID', id)
      .where('UnitName', 'like', '%sono%')
      .count('* as total');
    equipo = equipo[0].total;

    if (equipo === 0) {
      equipo = 'Reactor';
    } else {
      equipo = 'Sonolator';
    }

    let archives = await Archive.query()
      .where('Exportar', true)
      .where('Equipo', equipo)
      .fetch();
    archives = archives.toJSON();

    const archiveValueName = archives.map(item => `'${item.Tag}'`).join(',');

    const wincc = new WinCC();
    const desde = moment(batch.ActStart)
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');
    const hasta = moment(batch.ActEnd)
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');
    const historicos = await wincc.getHistoricos(archiveValueName, desde, hasta);

    response.status(200).json(historicos);
  }

  async exportarListadoBatchCSV({ request, response }) {
    let { filter } = request.get();

    filter = filter
      ? JSON.parse(filter)
      : {
          Name: null,
          MRecipeName: [],
          ProductName: [],
          ProductCode: [],
          ActStart: null,
          ActEnd: null
        };

    const ActStart =
      filter.ActStart ||
      new Date(
        moment()
          .add(-7, 'days')
          .format('YYYY-MM-DD')
      );
    const ActEnd = filter.ActEnd || new Date(moment().format('YYYY-MM-DD'));

    let batchs = null;
    const query = Batch.query();
    query
      .select(
        'Name AS Nombre',
        'ProductName AS Producto',
        'ProductCode AS Codigo',
        'MRecipeName AS Receta',
        'MRecipeVersion AS VersionReceta',
        'ActStart AS Inicio',
        'ActEnd AS Fin',
        'State AS Estado'
      )
      .where('ActStart', '>', ActStart)
      .where('ActEnd', '<', ActEnd);

    if (filter.Name) {
      query.where('Name', 'like', `%${filter.Name}%`);
    }

    if (filter.MRecipeName.length > 0) {
      query.whereIn('MRecipeName', filter.MRecipeName);
    }

    if (filter.ProductName.length > 0) {
      query.whereIn('ProductName', filter.ProductName);
    }

    if (filter.ProductCode.length > 0) {
      query.whereIn('ProductCode', filter.ProductCode);
    }

    batchs = await query.orderBy('ActStart', 'DESC').fetch();
    batchs = batchs.toJSON();
    batchs = batchs.map(batch => {
      // Duracion
      const inicio = moment(batch.Inicio);
      const fin = moment(batch.Fin);
      const duracion = fin.diff(inicio, 'seconds') / 60;
      batch.Duracion = mathjs.round(duracion, 2);

      // Tecnologia
      batch.Tecnologia = '';
      if (batch.Producto.length > 0) {
        if (
          batch.Producto.toLowerCase().includes('sh') ||
          batch.Producto.toLowerCase().includes('shampoo')
        ) {
          batch.Tecnologia = 'Shampoo';
        }
        if (
          batch.Producto.toLowerCase().includes('ac') ||
          batch.Producto.toLowerCase().includes('aco') ||
          batch.Producto.toLowerCase().includes('acondicionador')
        ) {
          batch.Tecnologia = 'Acondicionador';
        }
      }

      // Reactor
      batch.Reactor = '';
      if (batch.VersionReceta.length > 0) {
        // Reactor 1
        if (
          batch.VersionReceta.toLowerCase().includes('r1') ||
          batch.VersionReceta.toLowerCase().includes('r 1') ||
          batch.VersionReceta.toLowerCase().includes('reactor 1') ||
          batch.VersionReceta.toLowerCase().includes('reactor1')
        ) {
          batch.Reactor = 'Reactor 1';
        }

        // Reactor 2
        if (
          batch.VersionReceta.toLowerCase().includes('r2') ||
          batch.VersionReceta.toLowerCase().includes('r 2') ||
          batch.VersionReceta.toLowerCase().includes('reactor 2') ||
          batch.VersionReceta.toLowerCase().includes('reactor2')
        ) {
          batch.Reactor = 'Reactor 2';
        }

        // Reactor 3
        if (
          batch.VersionReceta.toLowerCase().includes('r3') ||
          batch.VersionReceta.toLowerCase().includes('r 3') ||
          batch.VersionReceta.toLowerCase().includes('reactor 3') ||
          batch.VersionReceta.toLowerCase().includes('reactor3')
        ) {
          batch.Reactor = 'Reactor 3';
        }

        // Sono
        if (batch.VersionReceta.toLowerCase().includes('sono')) {
          batch.Reactor = 'Sonolator';
        }
      }
      return batch;
    });

    const fields = [
      'Nombre',
      'Producto',
      'Codigo',
      'Tecnologia',
      'Reactor',
      'Inicio',
      'Fin',
      'Duracion'
    ];
    const opts = { fields };
    const csv = parse(batchs, opts);

    response.header('Content-type', 'text/csv');
    response.header('Content-Disposition', 'attachment; filename="lotes.csv"');
    response.send(csv);
  }
}

module.exports = BatchController;
