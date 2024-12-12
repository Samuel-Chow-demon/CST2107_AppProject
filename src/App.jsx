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
import { WorkSpaceDBProvider } from './context/workspaceDBContext';
import WorkSpaceBoard from './pages/WorkSpaceBoard';
import { UserDBProvider } from './context/userDBContext';
import SnakeGame from './game/snake/SnakeGame';
import { GameDBProvider } from './context/gameDBContext';
import LoungeBoard from './pages/LoungeBoard';
import NewsPage from './pages/NewsPage';
import { NewsDataProvider } from './context/newsContext';

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
            // '/home/boardpage', slice(1) remove the '/' from the constant, then add the "/:id" to pass the workspace id
            // And the projectID is optional when it is route to particular workspace project,
            path: CONST_PATH.boardpage.slice(1) + '/:id/:projectID?',
            element: <BoardPage />
          },
          {
            path: CONST_PATH.workspace.slice(1),      // '/home/workspace', slice(1) remove the '/' from the constant
            element: <WorkSpaceBoard />
          },
          {
            path: CONST_PATH.lounge.slice(1),      // '/home/lounge', slice(1) remove the '/' from the constant
            element: <LoungeBoard />
          },
          {
            path: CONST_PATH.loungeNews.slice(1), // '/home/lounge/news', slice(1) remove the '/' from the constant
            element: <NewsPage />
          },
          {
            path: CONST_PATH.gameSnake.slice(1),
            element: <SnakeGame />
          },
          {
            index: true,                                  // Default child route for '/home'
            element: <Navigate to={CONST_PATH.workspace.slice(1)} replace />  // Redirect to '/home/workspace'
          },
          {
            path: "*",                                    // default to home/workspace
            element: <Navigate to={CONST_PATH.workspace.slice(1)} replace />
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
          <WorkSpaceDBProvider>
            <UserDBProvider>
              <NewsDataProvider>
                <GameDBProvider>
                  {routes}
                </GameDBProvider>
              </NewsDataProvider>
            </UserDBProvider>
          </WorkSpaceDBProvider>
      </userContext.Provider>
    </AuthProvider>);
}

export default App
