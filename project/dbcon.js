var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'daitama',
  password        : '',
  database        : 'test'
});
module.exports.pool = pool;
