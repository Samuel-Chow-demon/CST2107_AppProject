// BoardPage.jsx
import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import BoardNavbar from '../components/BoardNavbar';
import Board from '../components/Board';
import './BoardPage.css';

const BoardPage = () => {
  const [isGridLayout, setIsGridLayout] = useState(false);

  const toggleLayout = () => {
    setIsGridLayout((prevLayout) => !prevLayout);
  };

  return (
    <div className="board-page">
      <AppNavbar />
      <BoardNavbar toggleLayout={toggleLayout} isGridLayout={isGridLayout} />
      <div className="board-content">
        <Board isGridLayout={isGridLayout} />
      </div>
    </div>
  );
};

export default BoardPage;
