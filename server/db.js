const Sqlite = require('better-sqlite3');
const DB = new Sqlite('./data/talks.db');

const SELECT_ALL_SQL = DB.prepare('select * from talk');
const INSERT_SQL = DB.prepare(`insert into talk (message, message_type, created_time) values (?, ?, ?)`);

exports.fetchAll = function () {
  return SELECT_ALL_SQL.all();
};

exports.addRecord = function (message, messageType, createTime) {
  INSERT_SQL.run([message, messageType, createTime]);
};
