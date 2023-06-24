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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import axios from 'axios';
import { startOfDay, endOfDay, parseISO, toDate } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function StatusBitAnalysis() {
  const [checkboxes, setCheckboxes] = useState({
    OnOff: false,
    DAC_SIGNAL: false,
  });

  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [filterClicked, setFilterClicked] = useState(false);

  const handleChange = (event) => {
    const { name, checked } = event.target;

    if (checked) {
      setCheckboxes((prevCheckboxes) => ({
        ...prevCheckboxes,
        [name]: checked,
      }));

      setFilteredRows([]);
      fetchLogs(name);
    } else {
      setCheckboxes((prevCheckboxes) => ({
        ...prevCheckboxes,
        [name]: checked,
      }));

      clearCheckboxes();
    }
  };

  const clearCheckboxes = () => {
    setCheckboxes((prevCheckboxes) => {
      const clearedCheckboxes = { ...prevCheckboxes };
      Object.keys(clearedCheckboxes).forEach((checkbox) => {
        clearedCheckboxes[checkbox] = false;
      });
      return clearedCheckboxes;
    });
    setFilteredRows([]);
  };

  const fetchLogs = async (logType) => {
    try {
      const response = await axios.get('http://localhost:3000/api/logs', {
        params: {
          logType: logType,
        },
      });
      const logs = response.data;
      setData(logs);
      setFilteredRows(logs);
      setTableColumns(Object.keys(logs[0]));
    } catch (error) {
      console.error(error);
    }
  };

  const filterRows = () => {
    if (selectedStartDate && selectedEndDate) {
      const startDate = startOfDay(selectedStartDate);
      const endDate = endOfDay(selectedEndDate);

      const filteredData = data.filter((row) => {
        const rowDate = parseISO(row.timestamp);
        return rowDate >= startDate && rowDate <= endDate;
      });

      setFilteredRows(filteredData);
    } else {
      setFilteredRows(data);
    }
  };

  const handleFilterClick = () => {
    setFilterClicked(true);
  };

  useEffect(() => {
    filterRows();
  }, [filterClicked, selectedStartDate, selectedEndDate]);

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
                  checked={checkboxes.deliveryservicememoryusage}
                  onChange={handleChange}
                  name="deliveryservicememoryusage"
                  value="deliveryservicememoryusage"
                />
              }
              label={
                <Typography variant="body1">
                  Delivery Service Memory Usage
                </Typography>
              }
            />
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.awmdetectionlog}
      onChange={handleChange}
      name="awmdetectionlog"
      value="awmdetectionlog"
    />
  }
  label={<Typography variant="body1">AWM Detection Log</Typography>}
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
                  {tableColumns.map((columnName) => (
                    <TableCell key={columnName}>{columnName}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    {tableColumns.map((columnName) => (
                      <TableCell key={columnName}>
                        {columnName === 'timestamp' ? (
                          <span>{row[columnName]}</span>
                        ) : (
                          row[columnName]
                        )}
                      </TableCell>
                    ))}
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
            selected={selectedStartDate}
            onChange={(date) => setSelectedStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Start Date"
            isClearable
          />
        </LocalizationProvider>
        <Typography variant="h6" sx={{ margin: '0px 16px' }}>
          -
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            selected={selectedEndDate}
            onChange={(date) => setSelectedEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="End Date"
            isClearable
          />
        </LocalizationProvider>
      </Box>
    </Box>
  );
}

export default StatusBitAnalysis;
