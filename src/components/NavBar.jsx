import { useState } from 'react';
import './NavBar.css';

const NavBar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    // If the same menu is clicked again, close it. Otherwise, open the new menu.
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  return (
    <nav className="navBar">
      <div className="leftSection">
        <img src="./src/logo.png" alt="Trello Logo" className="logo" />
        
        <div className="dropdown">
          <button className="navButton" onClick={() => toggleDropdown('workspaces')}>Workspaces</button>
          {openDropdown === 'workspaces' && (
            <div className="dropdownContent">
              <p>Current Workspace</p>
              <p>Your Workspaces</p>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button className="navButton" onClick={() => toggleDropdown('recent')}>Recent</button>
          {openDropdown === 'recent' && (
            <div className="dropdownContent">
              <p>Recent Board 1</p>
              <p>Recent Board 2</p>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button className="navButton" onClick={() => toggleDropdown('starred')}>Starred</button>
          {openDropdown === 'starred' && (
            <div className="dropdownContent">
              <p>Starred Board 1</p>
              <p>Starred Board 2</p>
            </div>
          )}
        </div>

        <div className="dropdown">
          <button className="navButton" onClick={() => toggleDropdown('templates')}>Templates</button>
          {openDropdown === 'templates' && (
            <div className="dropdownContent">
              <p>Template 1</p>
              <p>Template 2</p>
            </div>
          )}
        </div>
      </div>

      <div className="rightSection">
        <button className="searchButton">🔍</button>
        <button className="notificationButton">🔔</button>
        <button className="createButton">Create</button>
      </div>
    </nav>
  );
};

export default NavBar;
