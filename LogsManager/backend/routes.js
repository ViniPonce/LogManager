const multer = require('multer');
const express = require('express');
const router = express.Router();
const db = require('./db');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');

const upload = multer({ dest: 'uploads/' });


router.get('/logs', (req, res) => {
  const { logType, selectedBits } = req.query;
  let query = '';

  switch (logType) {
    case 'statusbitlog':
      if (selectedBits && selectedBits.length > 0) {
        const bitsInQueryFormat = selectedBits
          .map(bit => `(bit_status = '${bit.toUpperCase()} = 0' OR bit_status = '${bit.toUpperCase()} = 1')`)
          .join(' OR ');

        query = `SELECT * FROM statusbitlog WHERE ${bitsInQueryFormat} ORDER BY timestamp DESC`;
      } else {
        query = 'SELECT * FROM statusbitlog ORDER BY timestamp DESC';
      }
      break;

    case 'deliveryservicememoryusage':
      query = 'SELECT * FROM deliveryservicememoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;

    case 'awmdetectionlog':
      query = 'SELECT * FROM awmdetectionlog ORDER BY timestamp DESC LIMIT 0, 250';
      break;

    case 'audiocapturememoryusage':
      query = 'SELECT * FROM audiocapturememoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;

    case 'audiomatchingmemoryusage':
      query = 'SELECT * FROM audiomatchingmemoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;

    case 'audiowatermarkingmemoryusage':
      query = 'SELECT * FROM audiowatermarkingmemoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;

    case 'awmdetectorlog':
      query = 'SELECT * FROM awmdetectorlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'backendmemoryusage':
      query = 'SELECT * FROM backendmemoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;

    case 'batterychargecontrollog':
      query = 'SELECT * FROM batterychargecontrollog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'batterylifemonitorlog':
      query = 'SELECT * FROM batterylifemonitorlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'bluetoothcommslog':
      query = 'SELECT * FROM bluetoothcommslog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'btrclog':
      query = 'SELECT * FROM btrclog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'connectionmanagementlog':
      query = 'SELECT * FROM connectionmanagementlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'daclog':
      query = 'SELECT * FROM daclog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'dashboardcommunication':
      query = 'SELECT * FROM dashboardcommunication ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'deliveryservicememoryusage':
      query = 'SELECT * FROM deliveryservicememoryusage ORDER BY timestamp DESC LIMIT 0, 100';
      break;

    case 'dmbelog':
      query = 'SELECT * FROM dmbelog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'filerotationcontrol':
      query = 'SELECT * FROM filerotationcontrol ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'internetdataconsumptionlog':
      query = 'SELECT * FROM internetdataconsumptionlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'lamlog':
      query = 'SELECT * FROM lamlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'lcmmemoryusage':
      query = 'SELECT * FROM lcmmemoryusage ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'mainlog':
      query = 'SELECT * FROM mainlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'mainprocessmemoryusage':
      query = 'SELECT * FROM mainprocessmemoryusage ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'ntpserverlog':
      query = 'SELECT * FROM ntpserverlog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'onofflog':
      query = 'SELECT * FROM onofflog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'onoff_bit':
      query = 'SELECT * FROM statusbitlog WHERE bit_status = "ONOFF = 0" OR bit_status = "ONOFF = 1" ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'rtmdeliverylog':
      query = 'SELECT * FROM rtmdeliverylog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'statuslog':
      query = 'SELECT * FROM statuslog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'storagestats':
      query = 'SELECT * FROM storagestats ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'watchdoglog':
      query = 'SELECT * FROM watchdoglog ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'watchdogmemoryusage':
      query = 'SELECT * FROM watchdogmemoryusage ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    case 'workflowstepmanager':
      query = 'SELECT * FROM workflowstepmanager ORDER BY timestamp DESC LIMIT 0, 1000';
      break;

    default:
      res.status(400).json({ error: 'Invalid Log Type' });
      return;
  }

  db.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error searching log files' });
    } else {
      res.json(results);
    }
  });
});

router.post('/processar', upload.single('file'), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file received' });
  }

  const filePath = file.path;
  const timestamp = Date.now(); // Obtém o timestamp atual
  const targetDir = path.join(__dirname, 'uploads', `${file.filename}_${timestamp}`, file.filename);
  if (fs.existsSync(targetDir)) {
    return res.status(400).json({ error: 'Destination directory already exists' });
  }
  
  // Cria o diretório de destino para extrair o arquivo ZIP
  fs.mkdirSync(targetDir, { recursive: true });
  

  // Extrai o arquivo ZIP para o diretório de destino
  fs.createReadStream(filePath)
    .pipe(unzipper.Extract({ path: targetDir }))
    .on('close', () => {
      // Agora você pode percorrer os arquivos extraídos e fazer as operações necessárias no banco de dados
      // Use o caminho `targetDir` para acessar os arquivos extraídos

      // Comando para executar o script Python de processamento
      const command = `python ${path.join(__dirname, 'process.py')} "${filePath}"`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error}`);
          return res.status(500).json({ error: 'Error processing file' });
        }

        console.log(stdout);
        
        res.status(200).json({ message: 'File processed successfully' });
      });
    })
    .on('error', (error) => {
      console.error(`Error extracting ZIP file: ${error}`);
      res.status(500).json({ error: 'Error processing file' });
    });
});

module.exports = router;