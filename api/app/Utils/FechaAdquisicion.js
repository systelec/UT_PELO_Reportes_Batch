'use strict';

const moment = require('moment');
const Redis = use('Redis');

var FechaAdquisicion = {
  async arrayIteraciones(desde, hasta) {
    // Saco 3 minutos para compensar hora con la del servidor
    const salto = 'hours';
    desde = moment(desde);
    hasta = moment(hasta);

    let i = 0;
    let arrayIteraciones = [];
    const iteraciones = hasta.diff(desde, salto);

    if (iteraciones === 0) {
      arrayIteraciones.push({
        desde: desde.toDate(),
        hasta: hasta.toDate()
      });
    } else {
      let fechaInicial = moment(desde);

      for (i; i < iteraciones + 1; i++) {
        arrayIteraciones.push({
          desde: fechaInicial.toDate(),
          hasta: fechaInicial.add(1, salto).toDate()
        });
      }
      arrayIteraciones[arrayIteraciones.length - 1].hasta = hasta.toDate();

      arrayIteraciones = arrayIteraciones.filter(item => {
        if (item.desde !== item.hasta) {
          return true;
        }
      });
    }

    return arrayIteraciones;
  }
};

module.exports = FechaAdquisicion;
