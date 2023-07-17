const express = require('express');
const multer = require('multer'); // Importe o multer corretamente
const routes = require('./routes');
const fs = require('fs');
const unzipper = require('unzipper');

const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/api', routes);

app.listen(port, () => {
  console.log(`Servidor em execução na porta ${port}`);
});
