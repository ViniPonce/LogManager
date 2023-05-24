import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: '#b0c4de',
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
  },
  logo: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(5),
    width: '170px',
    height: 'auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    flexGrow: 1,
    marginLeft: theme.spacing(2),
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
      <img className={classes.logo} src="https://kantaribopemedia.com/wp-content/uploads/2022/09/KANTAR_IBOPE_MEDIA_Large_Logo_Black_RGB.png" alt="Logo" />
      <h1 className={classes.title}>Logs Manager</h1>
    </div>
  );
};

export default Header;
