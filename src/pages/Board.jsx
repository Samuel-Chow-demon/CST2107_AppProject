// /pages/BoardPage.jsx
import React from 'react';
import AppNavbar from '../components/AppNavbar';
import BoardNavbar from '../components/BoardNavbar';
import Board from '../components/Board';
import './BoardPage.css';

const BoardPage = () => {
  return (
    <div className="board-page">
      <AppNavbar />
      <BoardNavbar />
      <div className="board-content">
        <Board />
      </div>
    </div>
  );
};

export default BoardPage;
