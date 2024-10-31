import React, { useState } from 'react';
import './BoardMenu.css'; 

const BoardMenu = ({ isOpen, closeMenu }) => {
  return (
    <div className={`board-menu ${isOpen ? 'open' : ''}`}>
      <button className="close-btn" onClick={closeMenu}>
        &times;
      </button>
      <div className="menu-content">
        <h3>Board Menu</h3>
        <ul>
          <li>About this board</li>
          <li>Activity</li>
          <li>Settings</li>
          <li>Change background</li>
          {/* Add more items as needed */}
        </ul>
      </div>
    </div>
  );
};

export default BoardMenu;
