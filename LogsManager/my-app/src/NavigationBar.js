import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/system';
import './hoverEffects.css';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const Title = styled(Typography)({
  flexGrow: 1,
});

const StyledTab = styled(Tab)({
  '&.scale-hover': {
    transition: 'transform 0.3s',
  },
  '&.scale-hover:hover': {
    transform: 'scale(1.1)',
  },
});

function NavigationBar() {
  const location = useLocation();

  const getTabIndex = (pathname) => {
    switch (pathname) {
      case '/':
        return 0;
      case '/status-bit-analysis':
        return 1;
      case '/log-analysis':
        return 2;
      default:
        return false;
    }
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <Title variant="h6">Log Manager</Title>
        <Tabs value={getTabIndex(location.pathname)} variant="scrollable" scrollButtons="auto">
          <StyledTab className="scale-hover" label="Home" component={Link} to="/" />
          <StyledTab className="scale-hover" label="Status Bit Analysis" component={Link} to="/status-bit-analysis" />
          <StyledTab className="scale-hover" label="Log Analysis" component={Link} to="/log-analysis" />
        </Tabs>
      </Toolbar>
    </StyledAppBar>
  );
};

export default NavigationBar;