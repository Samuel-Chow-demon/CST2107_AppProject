// BoardPage.jsx
import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import BoardNavbar from '../components/BoardNavbar';
import Board from '../components/Board';
import './BoardPage.css';
import { Box } from '@mui/material';

const BoardPage = () => {
  const [isGridLayout, setIsGridLayout] = useState(false);

  const toggleLayout = () => {
    setIsGridLayout((prevLayout) => !prevLayout);
  };

  return (
    // <div className="board-page">
    //   <AppNavbar />
    //   <BoardNavbar toggleLayout={toggleLayout} isGridLayout={isGridLayout} />
    //   <div className="board-content">
    //     <Board isGridLayout={isGridLayout} />
    //   </div>
    // </div>

    <Box sx={{
        display:'flex',
        flexDirection:'column',
        justifyContent: 'center',
        width: '100vw',
        height: '100%'
      }}>
        <AppNavbar />
        <BoardNavbar toggleLayout={toggleLayout} isGridLayout={isGridLayout} />
        <div className="board-content">
          <Board isGridLayout={isGridLayout} />
        </div>
    </Box>
  );
};

export default BoardPage;
