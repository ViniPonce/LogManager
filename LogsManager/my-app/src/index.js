import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NavigationBar from './NavigationBar';
import Summary from './Summary';
import StatusBitAnalysis from './StatusBitAnalysis';
import LogAnalysis from './LogAnalysis';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './App.css';



const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});



function App() {
  return (
    <div className="container">
      <Router>
        <NavigationBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Summary />} />
            <Route path="/status-bit-analysis" element={<StatusBitAnalysis />} />
            <Route path="/log-analysis" element={<LogAnalysis />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();