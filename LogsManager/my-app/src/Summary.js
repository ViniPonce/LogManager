import React, { useState, useEffect } from 'react';
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
  const [fileList, setFileList] = useState([]);
  const fileInputRef = React.useRef();

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && (uploadedFile.type === 'text/plain' || uploadedFile.name.endsWith('.zip'))) {
      setFile(uploadedFile);
      setFileLoaded(true);
    } else {
      setFile(null);
      setFileLoaded(false);
      alert('Please, select a .zip file.');
    }
  };

  const handleFileUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      axios
        .post('https://logsmanager.eastus.cloudapp.azure.com/api/processar', formData)
        .then((response) => {
          console.log('Data processed:', response.data);
          setFileLoaded(true);
        })
        .catch((error) => {
          console.error('Error sending the file:', error);
        });
    } else {
      alert('Please, select a valid .zip file.');
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
      alert('Please, select a .zip file.');
    }
  };

  const fetchFileList = () => {
    axios
      .get('https://logsmanager.eastus.cloudapp.azure.com/api/files')
      .then((response) => {
        setFileList(response.data.files);
      })
      .catch((error) => {
        console.error('Error when searching the file list:', error);
      });
  };

  useEffect(() => {
    fetchFileList();
  }, []);

  const handleFileSelection = (fileName) => {
    const selectedFile = fileList.find((file) => file === fileName);
    if (selectedFile) {
      setFile(selectedFile);
      setFileLoaded(true);
    } else {
      console.error('Selected file not found on the file list.');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', margin: '80px 0' }}>
      <Typography variant="h4" align="left" gutterBottom>
        Welcome to the Logs Manager!
      </Typography>

      <UploadContainer 
        onDrop={handleFileDrop} 
        onDragOver={(event) => event.preventDefault()} 
        onClick={() => fileInputRef.current.click()}   // Add the onClick event here
      >
        <input 
          type="file" 
          accept=".txt,.zip" 
          id="upload-file" 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          ref={fileInputRef}  // Use the file input ref here
        />
        {fileLoaded ? (
          <Typography variant="body1" align="center" style={{ marginTop: '1rem' }}>
            File uploaded successfully!
          </Typography>
        ) : (
          <React.Fragment>
            <CloudUploadIcon fontSize="large" color="primary" />
            <UploadText variant="body1" align="center">
              Drag and drop or select your file.
              <br />
              <span className="opacity-text">*.zip*</span>
            </UploadText>
          </React.Fragment>
        )}
      </UploadContainer>

      {fileList.length > 0 && (
        <Box sx={{ marginTop: 2 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Available files:
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {fileList.map((file) => (
              <Grid item key={file}>
                <Button variant="outlined" onClick={() => handleFileSelection(file)}>
                  {file}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

{fileLoaded && (
  <Box 
    sx={{ 
      marginTop: 2,
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',  // Add this property to center the elements
      width: '100%', 
    }}
  >
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
    <Grid 
      container 
      spacing={2} 
      justifyContent="center" 
      sx={{ marginTop: 2 }}
    >
      <Grid item>
        <Button variant="contained" onClick={handleFileUpload}>
          Upload
        </Button>
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={() => setFileLoaded(false)}>
          Clean
        </Button>
      </Grid>
    </Grid>
  </Box>
)}
</Box>

  );
}

export default Summary;
