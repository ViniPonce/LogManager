const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'logsmanager.eastus.cloudapp.azure.com',
  user: 'desenvpm7',
  password: 'desenvpm7',
  database: 'pm7_logs',
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to database.', error);
  } else {
    console.log('Successfully connected with database.');
  }
});

module.exports = connection;
