var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_shandst',
  password        : '7017',
  database        : 'cs340_shandst'
});
module.exports.pool = pool;
