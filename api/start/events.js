const User = use('App/Models/User');
const moment = require('moment');
const Database = use('Database');
const Archive = use('App/Models/Archive');
const WinCC = require('../app/Services/WinCC');

// initialCreate();
// cyclicEvent();
// test();

async function cyclicEvent() {
  try {
    setTimeout(async () => {
      cyclicEvent();
    }, 20000);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
}

async function initialCreate() {
  let user = await User.query()
    .where('username', 'admin')
    .first();

  if (!user) {
    user = await User.create({
      username: 'admin',
      email: 'admin@unilever.com',
      password: 'admin'
    });
    console.log('Usuario creado con exito!');
  }
  console.log('email:', user.email, 'username:', user.username);
}

async function test() {
  let desde = '2019-03-01 20:00:00';
  let hasta = '2019-03-01 20:01:00';

  let archives = await Archive.query()
    .where('Exportar', true)
    .fetch();
  archives = archives.toJSON();
  const archiveValueName = archives.map(item => `'${item.Tag}'`).join(',');

  const wincc = new WinCC();
  const historicos = await wincc.getHistoricos(archiveValueName, desde, hasta);
  console.log(historicos);
}
