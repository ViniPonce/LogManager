
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
  Tabs,
  Tab,
} from '@mui/material';
import axios from 'axios';
import { startOfDay, endOfDay, parseISO, toDate } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import ButtonBase from '@mui/material/ButtonBase';
import { Fab } from '@mui/material';
import { Assignment as ReportsIcon } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import './LogAnalysis.css';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

function LogAnalysis() {
  const [checkboxes, setCheckboxes] = useState({
    OnOff: false,
    DAC_SIGNAL: false,
  });

  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleReportButtonClick = () => {
    setShowReportDialog(true);
  };

  const handleCloseReportDialog = () => {
    setShowReportDialog(false);
  };

  const [showGridView, setShowGridView] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [meterKey, setMeterKey] = useState('');

  const handleMeterKeyChange = (event) => {
    setMeterKey(event.target.value);
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const buttonStyles = {
    textDecoration: 'none',
    marginLeft: '-8px',
    color: '#393e46',
  };

  const clickedButtonStyles = {
    textDecoration: 'underline',
    textDecorationThickness: '3px',
    fontWeight: 'bold',
    color: '#1e56a0',
    marginLeft: '-8px',
  };

  const handleButtonClick = () => {
    setIsClicked(!isClicked);
  };

  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [data, setData] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [filterClicked, setFilterClicked] = useState(false);
  const [showSensorGridView, setShowSensorGridView] = useState(false);
  const [sensorReportData, setSensorReportData] = useState([]);
  const [sensorTableColumns, setSensorTableColumns] = useState([]);
  const [currentSensorPage, setCurrentSensorPage] = useState(1);
  const [totalSensorPages, setTotalSensorPages] = useState(0);
  const [sensorItemsPerPage] = useState(25);
  const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('General Report');
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  const handleRowClick = (index) => {

    if (index === selectedRowIndex) {
      setSelectedRowIndex(-1); 
    } else {
      setSelectedRowIndex(index); 
    }
  };

  const handleNextSensorPage = () => {
    if (currentSensorPage < totalSensorPages) {
      setCurrentSensorPage((prevPage) => prevPage + 1);
    }
  };
  
  const handlePreviousSensorPage = () => {
    if (currentSensorPage > 1) {
      setCurrentSensorPage((prevPage) => prevPage - 1);
    }
  };
  


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

const [currentPageInput, setCurrentPageInput] = useState(1);

const handlePageInputChange = (event) => {
  const inputPage = parseInt(event.target.value, 10);
  if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
    setCurrentPageInput(inputPage);
  }
};

const handlePageInputChangeAndGo = () => {
  setCurrentPage(currentPageInput);
};

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

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('/api/generate-report', {
        params: {
          meterName: meterKey,
        },
      });

      const reportData = response.data;

      const columns = reportData.length > 0 ? Object.keys(reportData[0]) : [];
      setShowGridView(true);
      setReportData(reportData);
      setTableColumns(columns);
      setTotalPages(Math.ceil(reportData.length / itemsPerPage));

    } catch (error) {
      console.error('Error generating report:', error);
    }
  };


  const [shouldGenerateSensorReport, setShouldGenerateSensorReport] = useState(false);
  const handleGenerateSensorReport = async (meterKey) => {
    if (shouldGenerateSensorReport) {
    try {
      const response = await axios.get('/api/generate-sensor-report', {
        params: {
          meterName: meterKey,
        },
      });
      console.log('API Response:', response.data);
  
      const sensorReportData = response.data;
      const columns = sensorReportData.length > 0 ? Object.keys(sensorReportData[0]) : [];

      setShowSensorGridView(true);
      setSensorReportData(sensorReportData);
      console.log(sensorReportData)
      setSensorTableColumns([columns]);
      setTotalSensorPages(Math.ceil(sensorReportData.length / sensorItemsPerPage));
    } catch (error) {
      console.error('Error generating sensor report:', error);
    }
  }
};


const startIndex = (currentSensorPage - 1) * sensorItemsPerPage;
const endIndex = startIndex + sensorItemsPerPage;


// useEffect(() => {
//   const response = handleGenerateSensorReport();
//   console.log(response)
//   setSensorReportData(response)

//   return () => {
    
//   }
// }, [])






// useEffect(() => {

//   const params = {
//     meterName: meterKey,
//     page: currentSensorPage,
//     perPage: sensorItemsPerPage,
//   };

//   setIsLoading(true);

//   axios
//     .get('/api/generate-sensor-report', { params })
//     .then((response) => {
//       const data = response.data.slice(startIndex, endIndex);
//       setSensorReportData(data);
//       setTotalSensorPages(Math.ceil(response.data.length / sensorItemsPerPage));
//     })

//     setShowSensorGridView(true);
//     setSensorReportData(sensorReportData);
//     console.log(sensorReportData)
//     setSensorTableColumns([columns]);
//     setTotalSensorPages(Math.ceil(sensorReportData.length / sensorItemsPerPage));

//     .catch((error) => {
//       console.error('Error fetching sensor data:', error);
//     })
//     .finally(() => {
//       setIsLoading(false);
//     });
// }, [currentSensorPage, sensorItemsPerPage, meterKey]);

  const fetchLogs = async (logType) => {
    try {
      const response = await axios.get('https://logsmanager.eastus.cloudapp.azure.com/api/logs', {
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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25); 
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const params = {
      meterName: meterKey, 
      page: currentPage,
      perPage: itemsPerPage,
    };

    setIsLoading(true);

    axios.get('/api/generate-report', { params })
      .then((response) => {
        const data = response.data;
        setReportData(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentPage, itemsPerPage, meterKey]);


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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >

      {showGridView && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {tableColumns.map((column, index) => (
                    <TableCell key={index} style={{ width: '30px' }}>{column}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
          {reportData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
            <TableRow
              key={index}
              className={`${index % 2 === 0 ? 'even-row' : 'odd-row'} ${index === selectedRowIndex ? 'selected-row' : ''}`} 
              onClick={() => handleRowClick(index)} 
              style={{ cursor: 'pointer' }}
            >
              {tableColumns.map((column, columnIndex) => (
                <TableCell key={columnIndex} style={{ width: '10px' }}> {row[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px', alignItems: 'center' }}>
  <IconButton
    disabled={currentPage === 1}
    onClick={handlePreviousPage}
    sx={{ marginRight: '16px' }}
  >
    <KeyboardDoubleArrowLeftIcon />
  </IconButton>
  <Typography variant="body1">
    Page {currentPage} of {totalPages}
  </Typography>
  <IconButton
    disabled={currentPage === totalPages}
    onClick={handleNextPage}
    sx={{ marginLeft: '16px' }}
  >
    <KeyboardDoubleArrowRightIcon />
  </IconButton>
  <TextField
    type="number"
    inputProps={{ min: 1, max: totalPages }}
    label="Go to Page"
    variant="outlined"
    size="small"
    value={currentPageInput}
    onChange={handlePageInputChange}
    onBlur={handlePageInputChangeAndGo}
    sx={{ width: '100px', marginLeft: '16px' }}
  />
</Box>
        </Paper>
      )}

{showSensorGridView && (
  <Paper>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {sensorTableColumns.map((column, index) => (
              <TableCell key={index} style={{ width: '30px' }}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sensorReportData.slice((currentSensorPage - 1) * sensorItemsPerPage,currentSensorPage * sensorItemsPerPage).map((row, index) => (
              <TableRow
                key={index}
                className={`${
                  index % 2 === 0 ? 'even-row' : 'odd-row'
                } ${index === selectedRowIndex ? 'selected-row' : ''}`}
                onClick={() => handleRowClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {sensorTableColumns.map((column, columnIndex) => (
                  <TableCell key={columnIndex} style={{ width: '10px' }}>{row[column]}</TableCell>
            ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px', alignItems: 'center' }}>
  <IconButton
    disabled={currentSensorPage === 1}
    onClick={handlePreviousSensorPage}
    sx={{ marginRight: '16px' }}
  >
    <KeyboardDoubleArrowLeftIcon />
  </IconButton>
  <Typography variant="body1">
    Page {currentSensorPage} of {totalSensorPages}
  </Typography>
  <IconButton
    disabled={currentSensorPage === totalSensorPages}
    onClick={handleNextSensorPage}
    sx={{ marginLeft: '16px' }}
  >
    <KeyboardDoubleArrowRightIcon />
  </IconButton>
  <TextField
    type="number"
    inputProps={{ min: 1, max: totalSensorPages }}
    label="Go to Page"
    variant="outlined"
    size="small"
    value={currentSensorPage}
    onChange={(e) => setCurrentSensorPage(parseInt(e.target.value, 10))}
    onBlur={handlePageInputChangeAndGo}
    sx={{ width: '100px', marginLeft: '16px' }}
  />
</Box>
        </Paper>
      )}

      </Box>
      {!showGridView && (
  <Fab
    color="primary"
    aria-label="Reports"
    onClick={handleReportButtonClick}
    className="floating-button"
    sx={{
      position: 'absolute',
      top: '8%',
      right: '2200px',
    }}
  >
    <Tooltip
      title="Reports"
      arrow
      PopperProps={{
        popperOptions: {
          placement: 'right',
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 10],
              },
            },
          ],
        },
      }}
    >
      <ReportsIcon />
    </Tooltip>
  </Fab>
)}


{showReportDialog && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    }}
  >
    {/* Conteúdo da tela de relatórios */}
    <Box
      sx={{
        backgroundColor: '#fcfefe',
        borderRadius: '4px',
        padding: '16px',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
        width: '50%',
        height: '50%', 
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
{/* Título "Reports" */}
<Typography
  variant="h6"
  sx={{
    marginBottom: '10px',
    textAlign: 'center', 
  }}
>
  Reports
</Typography>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="General Report" value="General Report" />
        <Tab label="Sensor Process Report" value="Sensor Process Report" />
      </Tabs>

      {/* Divider abaixo das abas */}
      <Divider sx={{ width: '100%', marginBottom: '24px' }} />

      {activeTab === 'General Report' && (
  <div>
    {/* Conteúdo da aba "General Report" */}
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Typography variant="h8" sx={{ flex: '0 0 auto', marginRight: '8px', marginTop: '4px' }}>
        Enter Meter Key:
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <TextField
          id="meterKey"
          label="Meter Key"
          variant="outlined"
          size="small"
          value={meterKey}
          onChange={handleMeterKeyChange}
          style={{ width: '30%', marginRight: '10px' }}
        />
<Button
  variant="contained"
  color="primary"
  sx={{
    backgroundColor: '#1e56a0',
    color: 'white',
  }}
  onClick={() => handleGenerateReport(meterKey)}
>
  Generate Report
</Button>
      </div>
    </div>

  </div>
)}

{activeTab === 'Sensor Process Report' && (
  <div>
    {/* Conteúdo da aba "Sensor Process Report" */}
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <Typography variant="h8" sx={{ flex: '0 0 auto', marginRight: '8px', marginTop: '4px' }}>
        Enter Meter Key:
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <TextField
          id="meterKey"
          label="Meter Key"
          variant="outlined"
          size="small"
          value={meterKey}
          onChange={handleMeterKeyChange}
          style={{ width: '30%', marginRight: '10px' }}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: '#1e56a0',
            color: 'white',
          }}
            onClick={() => {
              setShouldGenerateSensorReport(true);
              handleGenerateSensorReport(meterKey);
            }}
        >
          Generate Sensor Report
        </Button>
      </div>
    </div>

    {/* Aqui você pode adicionar o restante do conteúdo da aba "Process Log" */}
    {/* Certifique-se de incluir a tabela e os botões de paginação existentes */}
  </div>
)}

      {/* Botão para fechar a tela de relatórios */}
      <IconButton
        color="red"
        onClick={handleCloseReportDialog}
        sx={{ position: 'absolute', top: '8px', right: '8px' }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  </Box>
)}



<Box
  sx={{
    display: 'flex',
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
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: '16px',
        }}
      >
      </Box>
    </Box>
  );
}

export default LogAnalysis;