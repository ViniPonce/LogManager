import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Summary from './Summary';
import StatusBitAnalysis from './StatusBitAnalysis';
import LogAnalysis from './LogAnalysis';
import Sidebar from './Sidebar';
import reportWebVitals from './reportWebVitals';
import './index.css';
import './App.css';

const theme = createTheme({
  palette: {
    background: {
      default: '#f5f5f5',
    },
  },
  sidebar: {
    width: '300px',
    backgroundColor: 'white',
    color: 'black',
  },
  tabBar: {
    selectedTab: {
      borderBottom: '2px solid #2196f3',
    },
  },
});

function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    console.log('Theme toggled!');
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div style={{ display: 'flex' }}>
            <Sidebar theme={theme} />
            <div className="content" style={{ marginLeft: '300px', flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Summary />} />
                <Route path="/status-bit-analysis" element={<StatusBitAnalysis />} />
                <Route path="/log-analysis" element={<LogAnalysis />} />
              </Routes>
            </div>
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