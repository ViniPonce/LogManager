const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { mkdtempSync } = require('fs');
const path = require('path');
const { join } = require('path');
const multer = require('multer');
const { exec } = require('child_process');
const unzipper = require('unzipper');
const connection = require('./db');


const app = express();
app.use(cors());
app.use(bodyParser.json());

const uploadsDirectory = path.join(__dirname, 'uploads');

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const fileNameWithoutExtension = path.parse(file.originalname).name;
    const fileName = `${fileNameWithoutExtension}_${timestamp}.zip`;
    cb(null, fileName);
  },
});
const upload = multer({ storage });


//API UPLOAD
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.status(200).json({ message: 'File uploaded successfully!', file: req.file.filename });
});


//API LIST FILES
app.get('/api/files', (req, res) => {
  fs.readdir(uploadsDirectory, (err, files) => {
    if (err) {
      console.error('Erro ao ler diretório:', err);
      return res.status(500).json({ error: 'Erro ao listar arquivos.' });
    }
    const response = [];
    for (let file of files) {
      const extension = path.extname(file);
      const fileSizeInBytes = fs.statSync(path.join(uploadsDirectory, file)).size;
      const fileLastMod = fs.statSync(path.join(uploadsDirectory, file)).ctime;
      response.push({ name: file, extension, fileSizeInBytes, fileLastMod });
    }
    res.json(response);
  });
});
// Função para executar o script Python e retornar uma Promise
function executePythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const command = `/usr/bin/python3 "${scriptPath}" ${args.map(arg => `"${arg}"`).join(' ')}`;
    const options = {
      maxBuffer: 35 * 1024 * 1024, // Define o tamanho máximo do buffer para 35 MB
    };

    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

function execute_process_py(fileName, filePath) {
  const scriptPath = path.join(__dirname, 'LogmanagerDatabase', 'processing', 'process.py');
  const extractPath = path.join(__dirname, 'uploads', path.parse(fileName).name);

  return executePythonScript(scriptPath, [extractPath, filePath]);
}


app.post('/api/execute', async (req, res) => {
  const { fileName } = req.body;
  if (!fileName) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const filePath = path.join(__dirname, 'uploads', fileName);
  const extractPath = mkdtempSync(path.join(__dirname, 'uploads', 'extracted-'));

  // Descompacta o arquivo .zip
  try {
    console.log('filePath: ', filePath);
    console.log('extractPath:', extractPath);

    await unzipper.Open.file(filePath).then(async (zip) => {
      await zip.extract({ path: extractPath });
      console.log('Arquivo descompactado com sucesso');

      try {
        // Executa todos os scripts de processamento em paralelo
        const [resultProcessPy] = await Promise.all([
          execute_process_py(filePath, extractPath),
        ]);

        res.status(200).json({ message: 'All scripts executed successfully', resultProcessPy });
      } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Error processing file' });
      }
    });
  } catch (error) {
    console.error('Error extracting file:', error);
    res.status(500).json({ error: 'Error extracting file' });
  }
});



app.get('/api/generate-report', async (req, res) => {
  try {
    const meterName = req.query.meterName;

    const query = `
    (SELECT
      timestamp,
      logname,
      '-' AS pw_source,
      '-' AS op_status,
      '-' AS tv_status,
      '-' AS input_value,
      '-' AS panelists,
      '-' AS guests,
      '-' AS fk_statuslog_id,
      connection_status,
      '-' AS reading,
      '-' AS min_thresholdreading,
      '-' AS max_thresholdreading,
      '-' AS sensor_mode,
      '-' AS sensor_name,
      '-' AS device_connection,
      '-' AS range_connection,
      fk_bluetoothcommslog_id,
      '-' AS fk_onofflog_id
  FROM bluetoothcommslog b
  INNER JOIN meterid m ON b.fk_bluetoothcommslog_id = m.id
  WHERE m.meter_name = ?)
  
  UNION
  
  (SELECT
      timestamp,
      logname,
      '-' AS pw_source,
      '-' AS op_status,
      '-' AS tv_status,
      '-' AS input_value,
      '-' AS panelists,
      '-' AS guests,
      '-' AS fk_statuslog_id,
      connection_status,
      reading,
      min_thresholdreading,
      max_thresholdreading,
      '-' AS sensor_mode,
      '-' AS sensor_name,
      '-' AS device_connection,
      '-' AS range_connection,
      '-' AS fk_bluetoothcommslog_id,
      fk_onofflog_id
  FROM onofflog s
  INNER JOIN meterid m ON s.fk_onofflog_id = m.id
  WHERE m.meter_name = ?)
  
  UNION
  
  (SELECT
      timestamp,
      logname,
      pw_source,
      op_status,
      tv_status,
      input_value,
      panelists,
      guests,
      fk_statuslog_id,
      '-' AS connection_status,
      '-' AS reading,
      '-' AS min_thresholdreading,
      '-' AS max_thresholdreading,
      '-' AS sensor_mode,
      '-' AS sensor_name,
      '-' AS device_connection,
      '-' AS range_connection,
      '-' AS fk_bluetoothcommslog_id,
      '-' AS fk_onofflog_id
  FROM statuslog sl
  INNER JOIN meterid m ON sl.fk_statuslog_id = m.id
  WHERE m.meter_name = ?)
    
  ORDER BY timestamp;
    `;

    connection.query(query, [meterName, meterName, meterName,], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Error executing query' });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


app.get('/api/generate-sensor-report', async (req, res) => {
  try {
    const meterName = req.query.meterName;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 25;

    
    const offset = (page - 1) * perPage;

    const query = `
      SELECT s.*
      FROM sensorsprocesslog s
      INNER JOIN meterid m ON s.fk_sensorsprocess_id = m.id
      WHERE m.meter_name = ?
      ORDER BY timestamp
      LIMIT ? OFFSET ?;
    `;

    connection.query(query, [meterName, perPage, offset], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Error executing query' });
      } else {
        res.json(results);
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Servidor rodando na porta ${port}!`);
});
