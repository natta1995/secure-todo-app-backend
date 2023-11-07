const mysql = require('mysql2');

require('dotenv').config();

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Databasanslutningen misslyckades: ' + err.stack);
    return;
  }
  console.log('Ansluten till databasen som ID ' + connection.threadId);
});

module.exports = connection;
