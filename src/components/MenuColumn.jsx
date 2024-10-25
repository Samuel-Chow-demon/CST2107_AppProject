import './MenuColumn.css';

const MenuColumn = () => {
  return (
    <div className="menuColumn">
      <h2 className="menuTitle">Workspace</h2>
      <ul className="menuList">
        <li className="menuItem">Boards</li>
        <li className="menuItem">Members</li>
        <li className="menuItem">Workspace Settings</li>
      </ul>
      <h3 className="viewsTitle">Workspace Views</h3>
      <ul className="menuList">
        <li className="menuItem">Table</li>
        <li className="menuItem">Calendar</li>
      </ul>
      <h3 className="boardsTitle">Your Boards</h3>
      <ul className="menuList">
        <li className="menuItem">New Board</li>
      </ul>
    </div>
  );
};

export default MenuColumn;
