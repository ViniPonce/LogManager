import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: '#1976D2',
    color: '#FFFFFF',
    padding: theme.spacing(-2),
    display: 'flex',
    alignItems: 'center',
    zIndex: 9999,
    width: '100%',
    height: '65px',
    position: 'fixed',
    top: 0,
    left: 0,
    borderBottom: '1px solid #a9a9a9'
  },
  logo: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(0),
    width: '190px',
    height: '26px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '600',
    flexGrow: 1,
    marginLeft: theme.spacing(2),
    fontFamily: 'Tsukimi Rounded, sans-serif',
  },
  content: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(2),
  },
}));

const Header = () => {
  const classes = useStyles();

  return (
    <div className={classes.header}>
      <img className={classes.logo} src="https://upload.wikimedia.org/wikipedia/commons/1/17/Logo_Kantar_noir.png" alt="Logo" />
      <h1 className={classes.title}>Log Manager</h1>
    </div>
  );
};

export default Header;
