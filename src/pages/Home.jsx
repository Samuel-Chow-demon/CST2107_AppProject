import React, { useContext } from 'react';
import {checkIfUserLoggedInValid} from '../components/utility.js';
import HomeSideBar from '../components/HomeSideBar.jsx';
import userContext from '../context/userContext.js'
import BoardPage from './BoardPage.jsx';
import { Box } from '@mui/material';
import {useAuth} from '../context/authContext'

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
    // <Box sx={{
    //   display: 'flex',
    //   flexGrow: '1',
    //   width: '100vw',
    //   height: '100hw',
    //   margin: '0px'
    // }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          width: '100vw',
          height: '100vh'
        }}>
          <HomeSideBar />
          <Box sx={{
              flexGrow: 1,
              height: '100%'
            }}>
            <BoardPage />
          </Box>
      </Box>
    // </Box>
  )
}

export default Home