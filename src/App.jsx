import { useRoutes } from 'react-router-dom';
import {useState} from 'react';
import Home from './pages/Home';
import Landing from './pages/Landing';
import {CONST_PATH} from './components/front_end_constant';
import './App.css';
import LogInSignUp from './pages/LogInSignUp';
import BoardPage from './pages/BoardPage';
import useLocalStorage from './hooks/useLocalStorage';
import userContext from './context/userContext';
import {AuthProvider} from './context/authContext';

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
      },
      {
        path: CONST_PATH.boardpage,      // '/board'
        element: <BoardPage />
      }
    ]
  )
  
  return (
    <AuthProvider>
      <userContext.Provider value={{
          _currentUser,
          setCurrentUser
        }}>
        {routes}
      </userContext.Provider>
    </AuthProvider>);
}

export default App
