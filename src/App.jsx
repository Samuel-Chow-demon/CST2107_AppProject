import { Navigate, useRoutes } from 'react-router-dom';
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
import UserProfile from './pages/UserProfile';

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
        element: <Home />,
        children: [
          {
            path: CONST_PATH.userProfile.slice(1),   // '/home/userprofile', slice(1) remove the '/' from the constant
            element: <UserProfile />
          },
          {
            path: CONST_PATH.boardpage.slice(1),      // '/home/boardpage', slice(1) remove the '/' from the constant
            element: <BoardPage />
          },
          {
            index: true,                                  // Default child route for '/home'
            element: <Navigate to={CONST_PATH.boardpage.slice(1)} replace />  // Redirect to '/home/boardpage'
          },
          {
            path: "*",                                    // default to home/boardpage
            element: <Navigate to={CONST_PATH.boardpage.slice(1)} replace />
          }
        ]
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
