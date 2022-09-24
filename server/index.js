const HyperExpress = require('hyper-express');
const LiveDirectory = require('live-directory');
const store = require('./db');

const www = new LiveDirectory({
  path: 'www',
  ignore(path) {
    return path.startsWith('.') || false;
  },
});

const webserver = new HyperExpress.Server();

webserver.get('/www/*', (req, res) => {
  const path = req.path.replace('/www', '');
  const file = www.get(path);
  if (file) {
    return res.type(file.extension).send(file.buffer);
  }

  return res.status(404).send();
});

webserver.post('/api/messages', async (req, res) => {
  const msg = await req.json();
  store.addRecord(msg.message, msg.messageType, msg.createdTime);
  return res.status(200).send();
});

webserver.get('/api/messages', (req, res) => {
  const data = store.fetchAll();
  return res.json(data);
});

webserver.get('/', (req, res) => res.redirect('/www/index.html'));

webserver
  .listen(8088)
  .then(() => console.log('Webserver started on http://127.0.0.1:8088'))
  .catch(err => console.log('Failed to start webserver on port 8088\n\n%s', err));
