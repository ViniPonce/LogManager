const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nbhrn84k',
  database: 'pm7_logs',
});

connection.connect((error) => {
  if (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } else {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
  }
});

module.exports = connection;