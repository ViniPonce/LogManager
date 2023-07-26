import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { styled } from '@mui/system';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadContainer = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[900]}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#dcdcdc',
  height: '170px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  maxWidth: '1700px',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  '&:hover': {
    cursor: 'pointer',
  },
}));

const UploadText = styled(Typography)(({ theme }) => ({
  color: theme.palette.common.black,
  marginBottom: theme.spacing(1),
  fontFamily: 'Istok Web',
  fontWeight: 'normal',
  fontSize: '1.6rem',
  '& .opacity-text': {
    opacity: 0.7,
  },
  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
}));

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

      axios
      .post('http://logsmanager.eastus.cloudapp.azure.com/api/processar', formData)
      .then((response) => {
        console.log('Dados processados:', response.data);
        setFileLoaded(true);
      })
      .catch((error) => {
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', margin: '80px 0' }}>
      <Typography variant="h4" align="left" gutterBottom>
        Welcome to the Logs Manager!
      </Typography>

      <UploadContainer onDrop={handleFileDrop} onDragOver={(event) => event.preventDefault()}>
        <input type="file" accept=".txt,.zip" id="upload-file" onChange={handleFileChange} style={{ display: 'none' }} />
        {fileLoaded ? (
          <Typography variant="body1" align="center" style={{ marginTop: '1rem' }}>
            File loaded successfully!
          </Typography>
        ) : (
          <React.Fragment>
            <CloudUploadIcon fontSize="large" color="primary" />
            <UploadText variant="body1" align="center">
              Click to upload or drag and drop
              <br />
              <span className="opacity-text">*.zip or txt*</span>
            </UploadText>
          </React.Fragment>
        )}
      </UploadContainer>

      {fileLoaded && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>
            File Details:
          </Typography>
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
              <Button variant="contained" onClick={handleFileUpload}>
                Upload
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={() => setFileLoaded(false)}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default Summary;
