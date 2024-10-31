import React, { useState } from 'react';
import './BoardNavbar.css';
import BoardMenu from './BoardMenu';  // Import the sidebar menu

const BoardNavbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="board-navbar">
        <h1 className="board-title">Board Name</h1>
        {/* Menu button on the right */}
        <button className="menu-btn" onClick={toggleMenu}>
          &#x22EE; {/* Vertical ellipsis icon for menu */}
        </button>
      </nav>
      {/* Sidebar */}
      <BoardMenu isOpen={isMenuOpen} closeMenu={toggleMenu} />
    </>
  );
};

export default BoardNavbar;
