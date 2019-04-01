'use strict';

const OnlineParameterValue = use('App/Models/OnlineParameterValue');
const Database = use('Database');
const moment = use('moment');
const _ = require('lodash');
const Ws = use('Ws');
const Socket = require('../../Services/Socket');

class OnlineParameterValueController {
  async index({ request, response }) {
    let { page, sortBy, descending, perPage, search, searchField } = request.get();
    page = page || 1;
    sortBy = sortBy || 'Name';
    descending = descending || 'ASC';
    perPage = perPage || 10;
    searchField = searchField || 'Name';
    search = search || '';

    const onlineParameterValuess = await OnlineParameterValue.query()
      .orderBy(sortBy, descending)
      .where(searchField, 'like', `%${search}%`)
      .paginate(page, perPage);

    response.status(200).json(onlineParameterValuess);
  }

  async show({ request, response, params: { id } }) {
    const onlineParameterValues = await OnlineParameterValue.findOrFail(id);

    if (!onlineParameterValues) {
      response.status(404).json({
        message: 'OnlineParameterValue no encontrada.',
        id
      });
      return;
    }
    response.status(200).json(onlineParameterValues);
  }
}

module.exports = OnlineParameterValueController;
