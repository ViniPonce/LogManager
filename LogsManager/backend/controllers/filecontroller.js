const { exec } = require('child_process');

const processFile = (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file received' });
  }

  const filePath = file.path;

  // Comando para executar o script Python de processamento
  const command = `python process.py ${filePath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res.status(500).json({ error: 'Error processing file' });
    }

    // Aqui você pode tratar a saída (stdout) do script Python, se necessário

    res.status(200).json({ message: 'File processed successfully' });
  });
};

module.exports = { processFile };
