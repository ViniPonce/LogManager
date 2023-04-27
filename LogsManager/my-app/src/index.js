import React from 'react';
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

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    console.log('Theme toggled!');
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <div className="container">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <NavigationBar onThemeToggle={handleThemeToggle} theme={theme} />
          <div className="content">
            <Routes>
              <Route path="/" element={<Summary />} />
              <Route path="/status-bit-analysis" element={<StatusBitAnalysis />} />
              <Route path="/log-analysis" element={<LogAnalysis />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
