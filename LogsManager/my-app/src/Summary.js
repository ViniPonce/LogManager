import React, { useState, useEffect, Suspense } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, List, ListItem, ListItemText, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Backdrop } from '@mui/material';
import { Container, Stack, styled } from '@mui/system';
import axios from 'axios';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { formatDate, formatBytes } from './utils/format';
import FolderZipTwoToneIcon from '@mui/icons-material/FolderZipTwoTone';
import FolderOpenTwoToneIcon from '@mui/icons-material/FolderOpenTwoTone';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';



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
  maxWidth: '1200px',
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
  const fileInputRef = React.useRef();
  const [files, setFiles] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(false);

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
        .post('http://localhost:3000/api/upload', formData)
        .then((response) => {
          console.log('Dados processados:', response.data);
          setFileLoaded(true);
          fetchFiles();
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

  const handleRowClick = (file) => {
    setSelectedFile(file);
  };

const processFile = async () => {
  if (selectedFile) {
    setIsLoading(true); // Começar o loading aqui
    try {
      const response = await axios.post(
        'http://localhost:3000/api/execute',
        { fileName: selectedFile.name },
        { headers: { 'Content-Type': 'application/json' } }
      );
      console.log('Arquivo processado com sucesso:', response.data);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setIsLoading(false); // Parar o loading aqui
    }
  } else {
    console.log("Nenhum arquivo selecionado");
  }
};


  const fetchFiles = async () => {
    setIsLoading(true);
    const { data } = await axios.get("/api/files");
    data.sort((a, b) => new Date(b.fileLastMod) - new Date(a.fileLastMod));
    setFiles(data);
    setIsLoading(false);
  };


  useEffect(() => {
    fetchFiles();
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex', width: '90%', margin: '80px 0' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to the Log Manager!
      </Typography>

      <UploadContainer
        onDrop={handleFileDrop}
        onDragOver={(event) => event.preventDefault()}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          accept=".txt,.zip"
          id="upload-file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        {fileLoaded ? (
          <Typography variant="body1" align="center" style={{ marginTop: '1rem' }}>
            File loaded successfully!
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

      {fileLoaded && (
        <Box
          sx={{
            marginTop: 2,
            marginBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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


<Box sx={{ boxShadow: 15, border: '1px solid grey', borderRadius: '2px', }}>
  <Grid container>
    <Grid item xs={4} sx={{ borderRight: '1px solid grey', display: 'flex', flexDirection: 'column', backgroundColor: '#dcdcdc', }}>
      <TableCell sx={{ backgroundColor: '#fff', padding: '9.5px', display: 'flex', justifyContent: 'space-between' }}>
      <Button variant="outlined" color="primary" onClick={fetchFiles} startIcon={<RefreshRoundedIcon style={{ verticalAlign: 'middle' }} />}>
      <span style={{ verticalAlign: 'middle', position: 'relative', top: '1px' }}>Refresh</span>
      </Button>
      <Button variant="contained" onClick={processFile}
        startIcon={<PlayArrowRoundedIcon style={{ fontSize: 25, verticalAlign: 'middle' }} />}>
        <span style={{ verticalAlign: 'middle', position: 'relative', top: '1px' }}>Process</span>
      </Button>
      </TableCell>
      <TableContainer sx={{ background: "white", borderRadius: "0px", flexGrow: 1, backgroundColor: '#dcdcdc', }} >
        <Table aria-label="simple table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#fff', borderBottom: '1.9px solid grey' }}>
            <TableCell align="left">
              <Box sx={{ display: 'flex', alignItems: 'center', }}>
                <ArrowRightIcon />
                <FolderOpenTwoToneIcon sx={{ marginRight: 1 }} />
                <Typography variant="h7">Uploads</Typography>
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
          <TableBody>
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>

    <Grid item xs={8}>
      <Box sx={{ width: "100%", position: 'relative' }}>
        <Backdrop open={isLoading} style={{ zIndex: 9999, color: '#fff', position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', top: 0, left: 0, bottom: 0, right: 0 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {!files ? (
          <Box sx={{width: "100%", display: "flex", justifyContent: "center", }}>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ background: "white", borderRadius: "8px" }} >
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ borderBottom: 'px solid black' }}>
                  <TableRow>
                    <TableCell align="left">Name</TableCell>
                    <TableCell align="right">Last Modified</TableCell>
                    <TableCell align="right">File Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {files?.filter(file => file.name.endsWith('.zip')).map((file) => (
                    <TableRow
                      key={file.name}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: selectedFile === file ? '#ddd' : 'inherit',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                      }}
                      onClick={() => handleRowClick(file)}
                    >
                      <TableCell component="th" scope="row">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FolderZipTwoToneIcon sx={{ marginRight: 1 }} />
                          {file.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatDate(file.fileLastMod)}</TableCell>
                      <TableCell align="right">{formatBytes(file.fileSizeInBytes)}</TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Grid>
  </Grid>
</Box>
</Box>
);
}
export default Summary;
