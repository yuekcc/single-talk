const SessionEngine = require('hyper-express-session');
const MemorySession = new SessionEngine({
  duration: 1000 * 60 * 45,
  cookie: {
    name: 'session_id',
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: true,
    secret: 'something_for_signing_cookies',
  },
});

const MEM_CACHE = new Map();

MemorySession.use('read', async session => {
  return MEM_CACHE.get(`${session.id}`);
});

MemorySession.use('touch', async session => {
  // do nothing
});

MemorySession.use('write', async session => {
  MEM_CACHE.set(`${session.id}`, session.get());
});

MemorySession.use('destroy', async session => {
  MEM_CACHE.delete(`${session.id}`);
});

module.exports = MemorySession;
