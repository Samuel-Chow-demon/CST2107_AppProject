
import React from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {Button, TextField} from '@mui/material';
import { teal } from '@mui/material/colors'; // Import color palette

import bkgrd2 from '../assets/bkgrd2.png'
import bkgrd3 from '../assets/bkgrd3.png'
import bkgrd4 from '../assets/bkgrd4.png'
import bkgrd5 from '../assets/bkgrd5.png'
import bkgrd6 from '../assets/bkgrd6.png'
import iconSimpleWork from '../assets/SimpleWorkSmall.svg'

import './Landing.css';

const {useState, useEffect} = React;

// GridItem component
const GridItem = ({ item, index, moveItem, id }) => {
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
        <img src={item.src} alt="Grid item" className="grid-image" id={`id-grid-item-${id}`}/>
      ) : (
        <div className="grid-component flex justify-center items-center" id={`id-grid-item-${id}`}>{item.component}</div>
      )}
    </div>
  );
};

const LandingPage = () => {

  const displayTextList = ['Simple Work .\nWork Simple',
                            `Today is ${(new Date()).toLocaleDateString()}`,
                            "Welcome !"
  ];

  const [clickIdx, setClickIdx] = useState(0);
  const [displayText, setDisplayText] = useState(displayTextList[0]);

  const buttonClick = ()=>{
    setClickIdx(prevIdx=>(prevIdx + 1) % displayTextList.length);
  };

  // Define Sub Component
  // For Drag Component
  const TextComponent = ({displayText}) => {
    return (
      <div className="text-center p-5">
        <h2 style={{ whiteSpace: 'pre-line' }}>{displayText}</h2>
      </div>
    );
  };

  const ButtonComponent = ({buttonClick}) => {

    return (
      //<div className="text-center p-0 w-full h-20">
        <Button 
            fullWidth
            variant="contained"
            sx= {{
              padding: '24px 24px',
              fontSize: '28px',
              height: '250px',
              width: '250px',
              borderRadius: '50%',
              background: teal[500],
              boxShadow: '0px 20px 20px rgba(10, 20, 0, 0.3)'
            }}
            onClick={buttonClick}>
                Click To Hi !
        </Button>
      //</div>
    );
  };

  // Define useState
  const [items, setItems] = useState([
    { id: 1, type: 'image', src: bkgrd2 },
    { id: 2, type: 'image', src: bkgrd3 },
    { id: 3, type: 'component', component: <TextComponent displayText={displayText} /> },
    { id: 4, type: 'image', src: bkgrd4 },
    { id: 5, type: 'image', src: iconSimpleWork },
    { id: 6, type: 'image', src: bkgrd6 },
    { id: 7, type: 'component', component: <ButtonComponent buttonClick={buttonClick}/> },
    { id: 8, type: 'image', src: bkgrd5 },
    { id: 9, type: 'image', src: bkgrd3 }
  ]);

  // Define useEffect
  // When button click, switch the text and assign to the display
  useEffect(()=>{

    //console.log("In Display", clickIdx);
    setDisplayText(displayTextList[clickIdx]);

  }, [clickIdx]);

  // When display text change, update to the grid item
  useEffect(() => {

    //console.log("set Item " + displayText);

    setItems(prevItems => 
      prevItems.map(item => 
        item.type === 'component' && item.id === 3
          ? { ...item, component: <TextComponent displayText={displayText}/> }
          : item
      )
    );
  }, [displayText]);

  // Define Function, the drag Item replace the target hover item in the list
  const moveItem = (dragIndex, hoverIndex) => {
    const updatedItems = [...items];
    const [draggedItem] = updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, draggedItem);
    setItems(updatedItems);
  };

  return (
    <div className="flex justify-center items-center h-screen p-20">
      <DndProvider backend={HTML5Backend}>
        <div className="grid-container">
          {items.map((item, index) => (
            <GridItem
              key={item.id}
              id={item.id}
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