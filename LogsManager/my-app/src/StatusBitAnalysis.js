import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

function StatusBitAnalysis() {
  const [checkboxes, setCheckboxes] = useState({
    OnOff: false,
    DAC_SIGNAL: false,
  });

  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);

  const handleChange = (event) => {
    setCheckboxes({ ...checkboxes, [event.target.name]: event.target.checked });
  };

  const filterRows = () => {
    if (selectedStartDate && selectedEndDate) {
      const startDateTime = new Date(selectedStartDate);
      startDateTime.setHours(0, 0, 0, 0);

      const endDateTime = new Date(selectedEndDate);
      endDateTime.setHours(23, 59, 59, 999);

      const startDate = startDateTime.getTime();
      const endDate = endDateTime.getTime();

      const filteredData = data.filter((row) => {
        const rowDate = new Date(row.timestamp).getTime();
        return rowDate >= startDate && rowDate <= endDate;
      });

      setFilteredRows(filteredData);
    } else {
      setFilteredRows(data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000', {
        method: 'GET',
      });
      const jsonData = await response.json();
      setData(jsonData);
      setFilteredRows(jsonData);
    } catch (error) {
      console.log('Erro ao buscar os dados da API:', error);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '16px',
        marginTop: '80px',
      }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Status Bit Analysis
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          marginTop: '16px',
        }}
      >
        <Box
          sx={{
            border: '1px solid white',
            borderRadius: '4px',
            padding: '16px',
            marginRight: '16px',
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: '8px' }}>
            Logs
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ color: 'primary.main' }}
                  checked={checkboxes.OnOff}
                  onChange={handleChange}
                  name="OnOff"
                />
              }
              label={<Typography variant="body1">On Off</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ color: 'primary.main' }}
                  checked={checkboxes.DAC_SIGNAL}
                  onChange={handleChange}
                  name="DAC_SIGNAL"
                />
              }
              label={<Typography variant="body1">DAC Signal</Typography>}
            />
          </FormGroup>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            minWidth: '650px',
            marginRight: '16px',
          }}
        >
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Time Difference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.timestamp}</TableCell>
                    <TableCell>{row.timeDifference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
        <Typography variant="h6" sx={{ marginRight: '16px' }}>
          Date Filter:
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={selectedStartDate}
            onChange={(date) => setSelectedStartDate(date)}
            renderInput={(params) => <TextField {...params} />}
            clearable
          />
        </LocalizationProvider>
        <Typography variant="h6" sx={{ margin: '0px 16px' }}>
          -
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="End Date"
            value={selectedEndDate}
            onChange={(date) => setSelectedEndDate(date)}
            renderInput={(params) => <TextField {...params} />}
            clearable
          />
        </LocalizationProvider>
      </Box>
    </Box>
  );
}

export default StatusBitAnalysis;
