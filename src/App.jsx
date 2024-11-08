import { useRoutes } from 'react-router-dom';
import {useState} from 'react';
import Home from './pages/Home';
import Landing from './pages/Landing';
import {CONST_PATH} from './components/front_end_constant';
import './App.css';
import LogInSignUp from './pages/LogInSignUp';
import useLocalStorage from './hooks/useLocalStorage';
import userContext from './context/userContext';

function App() {

  const [_currentUser, setCurrentUser] = useLocalStorage('current_user', null);

  // Setup Front End Routes
  // Landing Page - Log In Page
  // Home Page - Project Dashboard

  const routes = useRoutes(
    [
      {
        path: CONST_PATH.landing,   // '/'
        element: <Landing />
      },
      {
        path: CONST_PATH.signInUp,   // '/signinup'
        element: <LogInSignUp />
      },
      {
        path: CONST_PATH.home,      // '/home'
        element: <Home />
      }
    ]
  )
  
  return (
    <userContext.Provider value={{
      _currentUser,
      setCurrentUser
    }}>
    {routes}
    </userContext.Provider>);
}

export default App
