import React, { useContext } from 'react';
import {checkIfUserLoggedInValid} from '../components/utility.js';
import HomeSideBar from '../components/HomeSideBar.jsx';
import AppNavbar from '../components/AppNavbar';
import userContext from '../context/userContext.js'
import { Box } from '@mui/material';
import {useAuth} from '../context/authContext'
import { Outlet } from 'react-router-dom';
import { CONST_PATH } from '../components/front_end_constant.js';

const {useState, useEffect} = React;

const Home = () => {

  const {_currentUser, setCurrentUser} = useContext(userContext);
  const {firebaseUser, isLoading} = useAuth();

  useEffect(() => {
      console.log("refresh");
      if (!isLoading)
      {
        console.log("after load", _currentUser);
        checkIfUserLoggedInValid(firebaseUser, _currentUser, setCurrentUser);
      }
  }, [isLoading, firebaseUser]); // The empty dependency array ensures this runs only on mount and unmount

  return (
      <>
        <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              width: '100vw',
              height: '100vh'
            }}>
              <HomeSideBar />
              <Box sx={{
                  display:'flex',
                  flexDirection:'column',
                  justifyContent: 'center',
                  width: 'calc(100vw - 256px)',
                  height: '100%'
                }}>
                <AppNavbar />
                {/* use Outlet can repalce the child component */}
                <Outlet />
              </Box>
          </Box>
      </>
  )
}

export default Home