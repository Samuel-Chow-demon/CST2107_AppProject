import React, { useContext } from 'react';
import './AppNavbar.css'; // Optional, for adding styles
import { Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import userContext from '../context/userContext';
import { capitalizeFirstLetter } from './utility';

const AppNavbar = () => {

  const {_currentUser, setCurrentUser} = useContext(userContext);

  return (
    <nav className="app-navbar">
      <div className="navbar-section">
        <Typography sx={{
          fontSize: '2rem',
          fontFamily: 'Pacifico',
          color: grey[100]  
        }}>
          Welcome, {capitalizeFirstLetter(_currentUser?.userName)}
        </Typography>
        {/* Add app-wide buttons/icons here */}
      </div>
    </nav>
  );
};

export default AppNavbar;
