const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nbhrn84k',
  database: 'logs_pm7',
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to database.', error);
  } else {
    console.log('Successfully connected with database.');
  }
});

module.exports = connection;
