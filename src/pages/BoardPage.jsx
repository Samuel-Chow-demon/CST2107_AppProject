// BoardPage.jsx
import React, { useState } from 'react';
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
        width: '100%',
        height: '100%'
      }}>
        <BoardNavbar toggleLayout={toggleLayout} isGridLayout={isGridLayout} />
        <Board isGridLayout={isGridLayout} />
    </Box>
  );
};

export default BoardPage;
