'use strict';

/*
|--------------------------------------------------------------------------
| Websocket
|--------------------------------------------------------------------------
|
| This file is used to register websocket channels and start the Ws server.
| Learn more about same in the official documentation.
| https://adonisjs.com/docs/websocket
|
| For middleware, do check `wsKernel.js` file.
|
*/

const Ws = use('Ws');
const Redis = use('Redis');

Ws.channel('socket', async ({ socket }) => {
  console.log('Se ha unido un usuario ID: %s', socket.id, 'Topic:', socket.topic);

  try {
  } catch (error) {
    console.log(error);
  }
});
