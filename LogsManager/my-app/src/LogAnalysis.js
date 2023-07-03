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

function LogAnalysis() {
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
        Log Analysis
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
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.audiocapturememoryusage}
      onChange={handleChange}
      name="audiocapturememoryusage"
      value="audiocapturememoryusage"
    />
  }
  label={<Typography variant="body1">Audio Capture Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.audiomatchingmemoryusage}
      onChange={handleChange}
      name="audiomatchingmemoryusage"
      value="audiomatchingmemoryusage"
    />
  }
  label={<Typography variant="body1">Audio Matching Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.audiowatermarkingmemoryusage}
      onChange={handleChange}
      name="audiowatermarkingmemoryusage"
      value="audiowatermarkingmemoryusage"
    />
  }
  label={<Typography variant="body1">Audio Watermarking Memory Usage</Typography>}
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
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.awmdetectorlog}
      onChange={handleChange}
      name="awmdetectorlog"
      value="awmdetectorlog"
    />
  }
  label={<Typography variant="body1">AWM Detector Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.backendmemoryusage}
      onChange={handleChange}
      name="backendmemoryusage"
      value="backendmemoryusage"
    />
  }
  label={<Typography variant="body1">Backend Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.batterychargecontrollog}
      onChange={handleChange}
      name="batterychargecontrollog"
      value="batterychargecontrollog"
    />
  }
  label={<Typography variant="body1">Battery Charge Control Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.batterylifemonitorlog}
      onChange={handleChange}
      name="batterylifemonitorlog"
      value="batterylifemonitorlog"
    />
  }
  label={<Typography variant="body1">Battery Life Monitor Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.bluetoothcommslog}
      onChange={handleChange}
      name="bluetoothcommslog"
      value="bluetoothcommslog"
    />
  }
  label={<Typography variant="body1">Bluetooth Comms Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.btrclog}
      onChange={handleChange}
      name="btrclog"
      value="btrclog"
    />
  }
  label={<Typography variant="body1">BTRC Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.connectionmanagementlog}
      onChange={handleChange}
      name="connectionmanagementlog"
      value="connectionmanagementlog"
    />
  }
  label={<Typography variant="body1">Connection Management Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.daclog}
      onChange={handleChange}
      name="daclog"
      value="daclog"
    />
  }
  label={<Typography variant="body1">DAC Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.dashboardcommunication}
      onChange={handleChange}
      name="dashboardcommunication"
      value="dashboardcommunication"
    />
  }
  label={<Typography variant="body1">Dashboard Communication</Typography>}
/>
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
  label={<Typography variant="body1">Delivery Service Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.dmbelog}
      onChange={handleChange}
      name="dmbelog"
      value="dmbelog"
    />
  }
  label={<Typography variant="body1">DMBE Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.filerotationcontrol}
      onChange={handleChange}
      name="filerotationcontrol"
      value="filerotationcontrol"
    />
  }
  label={<Typography variant="body1">File Rotation Control</Typography>}
/><FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.internetdataconsumptionlog}
      onChange={handleChange}
      name="internetdataconsumptionlog"
      value="internetdataconsumptionlog"
    />
  }
  label={<Typography variant="body1">Internet Data Consumption Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.lamlog}
      onChange={handleChange}
      name="lamlog"
      value="lamlog"
    />
  }
  label={<Typography variant="body1">LAM Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.lcmmemoryusage}
      onChange={handleChange}
      name="lcmmemoryusage"
      value="lcmmemoryusage"
    />
  }
  label={<Typography variant="body1">LCM Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.mainlog}
      onChange={handleChange}
      name="mainlog"
      value="mainlog"
    />
  }
  label={<Typography variant="body1">Main Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.mainprocessmemoryusage}
      onChange={handleChange}
      name="mainprocessmemoryusage"
      value="mainprocessmemoryusage"
    />
  }
  label={<Typography variant="body1">Main Process Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.ntpserverlog}
      onChange={handleChange}
      name="ntpserverlog"
      value="ntpserverlog"
    />
  }
  label={<Typography variant="body1">NTP Server Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.onofflog}
      onChange={handleChange}
      name="onofflog"
      value="onofflog"
    />
  }
  label={<Typography variant="body1">On Off Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.rtmdeliverylog}
      onChange={handleChange}
      name="rtmdeliverylog"
      value="rtmdeliverylog"
    />
  }
  label={<Typography variant="body1">RTM Delivery Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.statusbitlog}
      onChange={handleChange}
      name="statusbitlog"
      value="statusbitlog"
    />
  }
  label={<Typography variant="body1">Status Bit Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.statuslog}
      onChange={handleChange}
      name="statuslog"
      value="statuslog"
    />
  }
  label={<Typography variant="body1">Status Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.storagestats}
      onChange={handleChange}
      name="storagestats"
      value="storagestats"
    />
  }
  label={<Typography variant="body1">Storage Stats</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.watchdoglog}
      onChange={handleChange}
      name="watchdoglog"
      value="watchdoglog"
    />
  }
  label={<Typography variant="body1">Watchdog Log</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.watchdogmemoryusage}
      onChange={handleChange}
      name="watchdogmemoryusage"
      value="watchdogmemoryusage"
    />
  }
  label={<Typography variant="body1">Watchdog Memory Usage</Typography>}
/>
<FormControlLabel
  control={
    <Checkbox
      sx={{ color: 'primary.main' }}
      checked={checkboxes.workflowstepmanager}
      onChange={handleChange}
      name="workflowstepmanager"
      value="workflowstepmanager"
    />
  }
  label={<Typography variant="body1">Workflow Step Manager</Typography>}
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

export default LogAnalysis;
