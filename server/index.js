const HyperExpress = require('hyper-express');
const LiveDirectory = require('live-directory');

const store = require('./db');
const MemorySession = require('./session');

const INDEX = '/www/index.html';
const LOGIN = '/www/login.html';

const www = new LiveDirectory({
  path: 'www',
  ignore(path) {
    return path.startsWith('.') || false;
  },
});

const app = new HyperExpress.Server();

app.use(MemorySession);

const apiRouter = new HyperExpress.Router();
apiRouter.use(async (req, res) => {
  await req.session.start();
  const username = req.session.get('username') || '';
  if (username !== '') {
    return;
  }

  return res.status(401).header('location', LOGIN).send();
});

apiRouter.post('', async (req, res) => {
  const msg = await req.json();
  store.addRecord(msg.message, msg.messageType, msg.createdTime);
  return res.status(200).send();
});

apiRouter.get('', (req, res) => {
  const data = store.fetchAll();
  return res.json(data);
});

app.get('/www/*', (req, res) => {
  const path = req.path.replace('/www', '');
  const file = www.get(path);
  if (file) {
    return res.type(file.extension).send(file.buffer);
  }

  return res.status(404).send();
});

app.use('/api/messages', apiRouter);
app.post('/api/login', async (req, res) => {
  const { username, password } = await req.json();
  // 检查用户

  await req.session.start();
  req.session.set('username', username);

  return res.header('location', INDEX).send();
});
app.get('/api/logout', async (req, res) => {
  await req.session.destroy();
  return res.redirect(LOGIN);
});

app.get('/', (_, res) => res.redirect('/www/index.html'));

app
  .listen(8088)
  .then(() => console.log('started on http://127.0.0.1:8088'))
  .catch(err => console.log('Failed to start server, %s', err));
