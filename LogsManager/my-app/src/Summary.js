import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';

function Summary() {
  const [file, setFile] = useState(null);
  const [fileLoaded, setFileLoaded] = useState(false);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.zip'))) {
      setFile(uploadedFile);
      setFileLoaded(true);
    } else {
      setFile(null);
      setFileLoaded(false);
      alert('Please, select a .txt or .zip file.');
    }
  };

  const handleFileUpload = () => {
    if (file) {
      // Processar o arquivo carregado
      console.log('Arquivo carregado:', file);
      setFileLoaded(true);
    } else {
      alert('Please, select a valid .txt or .zip file.');
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const uploadedFile = event.dataTransfer.files[0];
    if (uploadedFile && (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.zip'))) {
      setFile(uploadedFile);
      setFileLoaded(true);
    } else {
      setFile(null);
      setFileLoaded(false);
      alert('Please, select a .txt or .zip file.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography variant="h4" align="center" gutterBottom>Welcome to the Log Manager!</Typography>
      
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {/* ... */}
      </Grid>

      
<Box sx={{ marginTop: 2 }}>
  <Typography variant="h5" align="center" gutterBottom>Please, select or drop your .zip or .txt file below.</Typography>
  <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
    <label htmlFor="upload-file" onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()} style={{ border: '4px dashed #aaa', padding: '2rem', borderRadius: '10px', height: '16rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', width: '80%', maxWidth: '40rem' }}>
      <input type="file" accept=".txt,.zip" id="upload-file" onChange={handleFileChange} style={{ display: 'none' }} />
      {fileLoaded ? (
        <Typography variant="body1" align="center" style={{ marginTop: '1rem' }}>File loaded successfully!</Typography>
      ) : (
        <Button variant="contained" component="span" style={{ position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)', top: '50%', width: '90%', maxWidth: '20rem' }}>Select or drop your file here.</Button>
      )}
    </label>
  </Box>
</Box>

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>Functionalities</Typography>
        <Typography variant="body1">1. Status Bit Analysis - Analyze a status bits and compare with other status bits.</Typography>
        <Typography variant="body1">2. Log Analysis - Analyze the logs, filter by date and also see the time difference between the status.</Typography>
        <Typography variant="body1">3. Function XYZ - XYZ.</Typography>
      </Box>

      {/* Adicione gráficos, tabelas ou feeds de notícias aqui */}

    </Box>
  );
}

export default Summary;
