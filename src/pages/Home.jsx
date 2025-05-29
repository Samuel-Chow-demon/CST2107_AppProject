
import { memo } from 'react';
import HomeSideBar from '../components/HomeSideBar.jsx';
import AppNavbar from '../components/AppNavbar';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import LogInExpireChecker from '../components/LogInExpireChecker.jsx';

const Home = () => {

  return (
      <>
        <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              width: '100vw',
              height: '100vh'
            }}>
              <LogInExpireChecker />
              <HomeSideBar />
              <Box sx={{
                  display:'flex',
                  flexDirection:'column',
                  justifyContent: 'center',
                  width: 'calc(100vw - 256px)',
                  height: '100%'
                }}>
                <AppNavbar />
                {/* use Outlet can repalce the child component */}
                <Outlet />
              </Box>
          </Box>
      </>
  )
}

export default memo(Home)