import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

function Summary() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && (uploadedFile.type === 'text/plain' || uploadedFile.type === 'application/zip')) {
      setFile(uploadedFile);
    } else {
      setFile(null);
      alert('Por favor, carregue um arquivo .txt ou .zip');
    }
  };

  const handleFileUpload = () => {
    if (file) {
      // Processar o arquivo carregado
      console.log('Arquivo carregado:', file);
    } else {
      alert('Por favor, selecione um arquivo .txt ou .zip válido');
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography variant="h4" align="center" gutterBottom>Log Analysis Application</Typography>
      <Typography variant="h6" align="center" gutterBottom>Welcome</Typography>
      
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Estatística 1</Typography>
              <Typography variant="body1">Descrição da Estatística 1</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Estatística 2</Typography>
              <Typography variant="body1">Descrição da Estatística 2</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5">Estatística 3</Typography>
              <Typography variant="body1">Descrição da Estatística 3</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ marginTop: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>Functionalities</Typography>
        <Typography variant="body1">1. Status Bit Analysis - Analyze a status bits and compare with other status bits.</Typography>
        <Typography variant="body1">2. Log Analysis - Analyze the logs, filter by date and also see the time difference between the status.</Typography>
        <Typography variant="body1">3. Function XYZ - XYZ.</Typography>
      </Box>
      
      {/* Você pode adicionar gráficos, tabelas ou feeds de notícias aqui */}

    </Box>
  );
}

export default Summary;