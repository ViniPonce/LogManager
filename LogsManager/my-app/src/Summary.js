import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import axios from 'axios';

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
      const formData = new FormData();
      formData.append('file', file);

      axios.post('http://localhost:5000/processar', formData) // Ajuste o URL para a porta correta (5000)
        .then(response => {
          console.log('Dados processados:', response.data);
          setFileLoaded(true);
        })
        .catch(error => {
          console.error('Erro ao enviar arquivo:', error);
        });
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '80px' }}>
      <Typography variant="h4" align="center" gutterBottom>Welcome to the Logs Manager!</Typography>

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

      {fileLoaded && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>File Details:</Typography>
          <Card>
            <CardContent>
              <Typography variant="body1">
                <strong>File Name:</strong> {file.name}
              </Typography>
              <Typography variant="body1">
                <strong>File Size:</strong> {file.size} bytes
              </Typography>
              <Typography variant="body1">
                <strong>File Type:</strong> {file.type}
              </Typography>
            </CardContent>
          </Card>
          <Grid container spacing={2} justifyContent="center" sx={{ marginTop: 2 }}>
            <Grid item>
              <Button variant="contained" onClick={handleFileUpload}>Upload</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={() => setFileLoaded(false)}>Clear</Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default Summary;
