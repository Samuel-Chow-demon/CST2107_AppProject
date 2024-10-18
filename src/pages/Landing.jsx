
import React from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {Button, TextField} from '@mui/material';

import './Landing.css';

const {useState, useEffect} = React;


// GridItem component
const GridItem = ({ item, index, moveItem }) => {
  const [, ref] = useDrag({
    type: 'item',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'item',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="grid-item">
      {item.type === 'image' ? (
        <img src={item.src} alt="Grid item" className="grid-image" />
      ) : (
        <div className="grid-component">{item.component}</div>
      )}
    </div>
  );
};

const LandingPage = () => {

  // Define Sub Component
  // For Drag Component
  const TextComponent = () => {
    return (
      <div className="text-center p-5 text-2xl">
        <h2>{displayText}</h2>
      </div>
    );
  };

  const ButtonComponent = () => {

    const buttonClick = ()=>{

      const DISPLAY_TEXT_IDX_LIMIT = 3;
  
      if (clickIdx >= 3)
      {
        setClickIdx(0);
      }
      else
      {
        setClickIdx(prevIdx=>prevIdx + 1)
      }
    };

    return (
      <div className="text-center p-5">
        <Button 
            fullWidth
            variant="contained"
            onClick={buttonClick}>
                Click Me !
        </Button>
      </div>
    );
  };

  // Define useState
  const [items, setItems] = useState([
    { id: 1, type: 'image', src: '../assets/bkgrd1.png' },
    { id: 2, type: 'image', src: '../assets/bkgrd2.png' },
    { id: 3, type: 'component', component: <TextComponent /> },
    { id: 4, type: 'component', component: <ButtonComponent /> },
    { id: 5, type: 'image', src: '../assets/bkgrd4.png' },
    { id: 6, type: 'image', src: '../assets/bkgrd6.png' }
  ]);

  const [clickIdx, setClickIdx] = useState(0);
  const [displayText, setDisplayText] = useState('SimpleWork.WorkSimple');

  // Define useEffect
  useEffect(()=>{

    const DISPLAY_TEXT_IDX_LIMIT = 3;

    const today = new Date();

    switch (clickIdx)
    {
      case 0:
        setDisplayText("SimpleWork.WorkSimple");
        break;
      case 1:
        const today = new Date();
        setDisplayText(today.toLocaleDateString());
        break;
      case 2:
        setDisplayText("Welcome !");
        break;
      default:  
        break;
    }

  }, [clickIdx]);

  // Define Function, the drag Item replace the target hover item in the list
  const moveItem = (dragIndex, hoverIndex) => {
    const updatedItems = [...items];
    const [draggedItem] = updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, draggedItem);
    setItems(updatedItems);
  };

  return (
    <div className="flex justify-center items-center h-screen py-20">
      <DndProvider backend={HTML5Backend}>
        <div className="grid-container">
          {items.map((item, index) => (
            <GridItem
              key={item.id}
              index={index}
              item={item}
              moveItem={moveItem}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  )
}

export default LandingPage