'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' };
});

// Batch
Route.get('api/v1/batches', 'BatchController.index');
Route.get('api/v1/batches/:id/term_trans', 'BatchController.indexTermTrans');
Route.get('api/v1/batches/:id/cdv_messages', 'BatchController.indexCDVMessage');
Route.get('api/v1/batches/export_csv', 'BatchController.exportarListadoBatchCSV');
Route.get('api/v1/batches/:id/export_csv', 'BatchController.exportarListadoBatchCSV');

// TermTrans
Route.get('api/v1/term_trans', 'TermTranController.index');
Route.get('api/v1/term_trans/export_csv', 'TermTranController.exportarListadoTermTransCSV');

// OnlineParameterValue
Route.get('api/v1/online_parameter_values', 'OnlineParameterValueController.index');
Route.get('api/v1/online_parameter_values/:id', 'OnlineParameterValueController.show');
