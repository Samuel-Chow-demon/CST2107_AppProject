import React, { useContext } from 'react';
import {checkIfUserLoggedInValid} from '../components/utility.js';
import HomeSideBar from '../components/HomeSideBar.jsx';
import userContext from '../context/userContext.js'

const {useState, useEffect} = React;

const Home = () => {

  const {_currentUser, setCurrentUser} = useContext(userContext);

  useEffect(() => {

      checkIfUserLoggedInValid(_currentUser, setCurrentUser);
  }, []); // The empty dependency array ensures this runs only on mount and unmount

  return (
    <div className = "w-screen h-screen flex justify-left m-0">
      <HomeSideBar />

    </div>
  )
}

export default Home