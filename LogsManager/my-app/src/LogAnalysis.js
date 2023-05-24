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
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

function createData(timestamp, timeDifference) {
  return { timestamp, timeDifference };
}

const rows = [
  createData('2023-01-01 12:00:00', '00:01:05'),
  createData('2023-01-01 12:01:05', '00:01:07'),
  createData('2023-01-02 12:01:05', '00:00:10'),
  createData('2023-01-03 12:03:05', '00:01:10'),
];

function LogAnalysis() {
  const [checkboxes, setCheckboxes] = useState({
    OnOff: false,
    DAC_SIGNAL: false,
  });

  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredRows, setFilteredRows] = useState(rows);

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

      const filteredData = rows.filter((row) => {
        const rowDate = new Date(row.timestamp).getTime();
        return rowDate >= startDate && rowDate <= endDate;
      });

      setFilteredRows(filteredData);
    } else {
      setFilteredRows(rows);
    }
  };

  const handleFilterClick = () => {
    filterRows();
  };

  const handleStartDateChange = (date) => {
    setSelectedStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

  useEffect(() => {
    filterRows();
  }, [selectedStartDate, selectedEndDate]);

  return (
    <Box sx={{ marginTop: '80px' }}>
      <Typography variant="h5" align="center" gutterBottom>
        Log Analysis
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', width: '100%' }}>
        <Box sx={{ border: '1px solid white', borderRadius: 1, padding: 2, marginRight: 2 }}>
          <Typography variant="h6" sx={{ marginBottom: 1 }}>
            Logs
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox checked={checkboxes.OnOff} onChange={handleChange} name="OnOff" />}
              label={<Typography variant="body1">BTRC Lost Connection</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={checkboxes.DAC_SIGNAL} onChange={handleChange} name="DAC_SIGNAL" />}
              label={<Typography variant="body1">OS_RST</Typography>}
            />
          </FormGroup>
        </Box>
        <TableContainer component={Paper} sx={{ width: '75%', minWidth: 600 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Time Difference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.timestamp}>
                  <TableCell>{row.timestamp}</TableCell>
                  <TableCell>{row.timeDifference}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 2 }}>
        <Typography variant="body1" sx={{ marginRight: 1 }}>
          Date Filter:
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={selectedStartDate}
            onChange={handleStartDateChange}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
          <Box sx={{ mx: 2 }} />
          <DatePicker
            label="End Date"
            value={selectedEndDate}
            onChange={handleEndDateChange}
            renderInput={(params) => <TextField {...params} size="small" />}
          />
        </LocalizationProvider>
      </Box>
    </Box>
  );
}

export default LogAnalysis;