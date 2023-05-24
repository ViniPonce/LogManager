import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { HomeOutlined, AssessmentOutlined, AssignmentOutlined } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // Ajuste: alinhar os ícones à esquerda
    justifyContent: 'flex-start',
    backgroundColor: '#a9a9a9',
    color: '#000000',
    width: '250px',
    height: '100vh',
    position: 'fixed',
    top: '64px',
    left: 0,
    padding: theme.spacing(2),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 999,
  },
  listItem: {
    paddingLeft: theme.spacing(1), // Ajuste: reduzir o espaçamento à esquerda
    marginBottom: theme.spacing(-1), // Ajuste: reduzir o espaçamento vertical
    cursor: 'pointer',
  },
  listItemText: {
    marginLeft: theme.spacing(-3), // Ajuste: adicionar espaçamento entre o ícone e o texto
    fontWeight: 'bold', // Ajuste: definir o texto em negrito
  },
}));

const Sidebar = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/');
  };

  const navigateToStatusBitAnalysis = () => {
    navigate('/status-bit-analysis');
  };

  const navigateToLogAnalysis = () => {
    navigate('/log-analysis');
  };

  return (
    <div>
      <Header />
      <div className={classes.root}>
        <div className={classes.logo}></div>
        <List component="nav" aria-label="main mailbox folders">
          <ListItem button className={classes.listItem} onClick={navigateToHome}>
            <ListItemIcon>
              <HomeOutlined />
            </ListItemIcon>
            <ListItemText primary="Home" className={classes.listItemText} />
          </ListItem>
          <ListItem button className={classes.listItem} onClick={navigateToStatusBitAnalysis}>
            <ListItemIcon>
              <AssessmentOutlined />
            </ListItemIcon>
            <ListItemText primary="Status Bit Analysis" className={classes.listItemText} />
          </ListItem>
          <ListItem button className={classes.listItem} onClick={navigateToLogAnalysis}>
            <ListItemIcon>
              <AssignmentOutlined />
            </ListItemIcon>
            <ListItemText primary="Log Analysis" className={classes.listItemText} />
          </ListItem>
        </List>
      </div>
    </div>
  );
};

export default Sidebar;
