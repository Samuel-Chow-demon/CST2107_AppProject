import { useRoutes } from 'react-router-dom';
import Home from './pages/Home';
import LandingPage from './pages/LandingPage';
import LogInPage from './pages/LogInPage';
import './App.css';

function App() {

  // Setup Front End Routes
  // Landing Page - Log In Page
  // Home Page - Project Dashboard

  let pagesComponent = useRoutes(
    [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: '/login',
        element: <LogInPage />
      },
      {
        path: '/home',
        element: <Home />
      }
    ]
  )
  
  return pagesComponent;
}

export default App
