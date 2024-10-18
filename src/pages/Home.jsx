import React from 'react';
import {checkIfUserLoggedInValid} from '../components/utility.js';

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
    <div>Home</div>
  )
}

export default Home