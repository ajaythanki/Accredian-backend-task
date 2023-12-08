const mysql = require("mysql");
const config = require("../utils/config");

// connection configurations
const conn = mysql.createConnection({
  host: config.HOST,
  user: config.USER,
  password: config.PASSWORD,
  database: config.DATABASE,
});

module.exports = conn;