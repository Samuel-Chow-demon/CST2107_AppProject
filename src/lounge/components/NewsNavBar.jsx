import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import { purple } from '@mui/material/colors';

import { categoryNews } from './newsConstant';
import { getNewsData } from '../../api_services/api';
import { useNewsData } from '../../context/newsContext';

function NewsNavBar() {

  const {
    setNewsData,
    setCurCategory, setIsLoading
  } = useNewsData();

  const clickNavBar = async (categoryObj) =>{
    setIsLoading(true);
    const data = await getNewsData(setNewsData, setCurCategory, categoryObj.apiPath);
    setIsLoading(false);
    //console.log(data);
  }

  return (
    <AppBar position="static" sx={{backgroundColor: purple[400]}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <NewspaperIcon sx={{ display: 'flex', mr: 2 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/home/lounge/news"
            sx={{
              mr: 10,
              display: 'flex',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'white',
              textDecoration: 'none',
              flexShrink: 0, // prevent shrinking
            }}
          >
            NEWS
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 5 }}>
            {categoryNews.map((category) => (
              <Button
                key={category.display}
                onClick={()=>{clickNavBar(category)}}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {category.display}
              </Button>
            ))}
          </Box>
          
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default NewsNavBar;
