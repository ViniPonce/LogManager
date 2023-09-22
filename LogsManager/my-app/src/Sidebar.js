import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { HomeOutlined, AssessmentOutlined, AssignmentOutlined } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import Header from './Header';
import WebFont from 'webfontloader';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: '#dcdcdc',
    color: '#000000',
    width: '250px',
    height: '100vh',
    position: 'fixed',
    top: '64px',
    left: 0,
    padding: theme.spacing(2),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    zIndex: 999,
    borderRight: '1px solid #a9a9a9',
    transition: 'width 0.3s',
  },
  listItem: {
    paddingLeft: theme.spacing(0),
    marginBottom: theme.spacing(0),
    cursor: 'pointer',
  },
  listItemText: {
    marginLeft: theme.spacing(-3),
    fontWeight: '400',
    fontFamily: "'Play', sans-serif",
  },
  collapsedText: {
    display: 'none',
  },
  selectedTab: {
    backgroundColor: '#ffffff',
    boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)',
    paddingLeft: theme.spacing(0.8),
    borderLeft: '4px solid #00bfff',
    width: '120%',
  },
  collapsedSelectedTab: {
    borderLeft: 'none',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    right: '-20px',
    transform: 'translateY(-50%)',
    backgroundColor: '#dcdcdc',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    padding: '12px',
    borderRadius: '70%',
    cursor: 'pointer',
    transition: 'right 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    width: '32px',
    height: '3%',
  },
  chevronIcon: {
    fontSize: '24px',
  },
  collapsed: {
    width: '55px',
  },
  collapsedLogo: {
    width: '30px',
  },
}));

const Sidebar = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = React.useState('home');
  const [collapsed, setCollapsed] = React.useState(false);

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const navigateTo = (path, tab) => {
    navigate(path);
    handleTabClick(tab);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  React.useEffect(() => {
    WebFont.load({
      google: {
        families: ['Play:300,400,700&display=swap'],
      },
    });
  }, []);

  return (
    <div>
      <Header />
      <div className={`${classes.root} ${collapsed ? classes.collapsed : ''}`}>
        <div className={`${classes.logo} ${collapsed ? classes.collapsedLogo : ''}`}></div>
        <List component="nav" aria-label="main mailbox folders">
          <ListItem
            button
            className={`${classes.listItem} ${selectedTab === 'logAnalysis' && !collapsed ? classes.selectedTab : ''} ${
              selectedTab === 'logAnalysis' && collapsed ? classes.collapsedSelectedTab : ''
            }`}
            onClick={() => navigateTo('/log-analysis', 'logAnalysis')}
          >
            <ListItemIcon>
              <AssignmentOutlined />
            </ListItemIcon>
            <ListItemText
              primary="Log Analysis"
              className={`${classes.listItemText} ${collapsed ? classes.collapsedText : ''}`}
            />
          </ListItem>
        </List>
        <div className={`${classes.arrowButton} ${collapsed ? '' : classes.collapsed}`} onClick={toggleCollapse}>
          {collapsed ? <ChevronRightIcon className={classes.chevronIcon} /> : <ChevronLeftIcon className={classes.chevronIcon} />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
