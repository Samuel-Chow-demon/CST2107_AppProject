import { useRoutes } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import {CONST_PATH} from './components/front_end_constant';
import './App.css';
import LogInSignUp from './pages/LogInSignUp';

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
        path: CONST_PATH.signInUp,   // '/signinup'
        element: <LogInSignUp />
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
