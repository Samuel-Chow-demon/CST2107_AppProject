import React from 'react';
import {checkIfUserLoggedInValid} from '../components/utility.js';
import HomeSideBar from '../components/HomeSideBar.jsx';

const {useState, useEffect} = React;

const Home = () => {

  const [isCheckedLogInValid, setCheckedLogInValid] = useState(false);

  useEffect(() => {

    // Since the React may trigger multiple render
    if (!isCheckedLogInValid)
    {
      setCheckedLogInValid(true);

      // EveryTime when access Home Page
      checkIfUserLoggedInValid();
    }

  }, []); // The empty dependency array ensures this runs only on mount and unmount

  return (
    <div className = "w-screen h-screen flex justify-left m-0">
      <HomeSideBar />

    </div>
  )
}

export default Home