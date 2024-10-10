import { useRoutes } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import {CONST_PATH} from './components/front_end_constant';
import './App.css';

function App() {

  // Setup Front End Routes
  // Landing Page - Log In Page
  // Home Page - Project Dashboard

  let pagesComponent = useRoutes(
    [
      {
        path: CONST_PATH.landing,   // '/'
        element: <Landing />
      },
      {
        path: CONST_PATH.login,     // '/login'
        element: <LogIn />
      },
      {
        path: CONST_PATH.signup,    // '/signup'
        element: <SignUp />
      },
      {
        path: CONST_PATH.home,      // '/home'
        element: <Home />
      }
    ]
  )
  
  return pagesComponent;
}

export default App
