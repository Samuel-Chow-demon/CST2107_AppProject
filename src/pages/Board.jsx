import React from 'react';
import AppNavbar from '../components/AppNavbar'; 
import BoardNavbar from '../components/BoardNavbar'; 
import Board from '../components/Board';  
import './BoardPage.css';  

const BoardPage = () => {
  return (
    <div className="board-page">
      {/* App-wide Navbar */}
      <AppNavbar />
      {/* Board-specific Navbar */}
      <BoardNavbar />
      {/* Main Board Content */}
      <div className="board-content">
        <Board />
      </div>
    </div>
  );
};

export default BoardPage;
