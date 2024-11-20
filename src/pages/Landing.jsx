
import {useState, useEffect, useContext} from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {Avatar, Button, TextField} from '@mui/material';
import { teal, indigo, orange } from '@mui/material/colors'; // Import color palette

import bkgrd1 from '../assets/bkgrd1.png'
import bkgrd2 from '../assets/bkgrd2.png'
import bkgrd3 from '../assets/bkgrd3.png'
import bkgrd4 from '../assets/bkgrd4.png'
import bkgrd5 from '../assets/bkgrd5.png'
import bkgrd6 from '../assets/bkgrd6.png'
import bkgrd7 from '../assets/bkgrd7.png'
import iconSimpleWork from '../assets/SimpleWorkSmallWhitebkg.svg'

import './Landing.css';
import { useNavigate } from 'react-router-dom';
import { CONST_PATH } from '../components/front_end_constant';
import { signOutUser } from '../components/utility';
import userContext from '../context/userContext.js'

import HomeIcon from '@mui/icons-material/Home';

// GridItem component
const GridItem = ({ item, index, moveItem, id }) => {
  const [, ref] = useDrag({
    type: 'item',
    item: { index },
    //canDrag: (id !== 5)
  });

  const [, drop] = useDrop({
    accept: 'item',
    hover: (draggedItem) => {

      // not allow to place on the app logo
      // if (id === 5)
      // {
      //   return;
      // }

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

  const navigate = useNavigate();

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const displayTextList = ['Simple Work .\nWork Simple',
                            `Today is ${(new Date()).toLocaleDateString()}`,
                            "Manage Work .\nDrag and Drop"
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

  const TextUserComponent = () => {

    const userName = _currentUser && _currentUser.userName ? _currentUser.userName : "Talent";
    const textUserDisplay = `Welcome,\n${userName}`;

    return (
      <>
        {_currentUser  && (
            <div className="text-center p-5 flex justify-center items-center">
            <h2 style={{ whiteSpace: 'pre-line' }}>{textUserDisplay}</h2>
            <Avatar 
                sx= {{
                borderRadius: '50%',
                margin: '0px 0px 0px 25px',
                width: '4em',
                height: '4em',
                background: teal[500],
                '&:hover': {
                  backgroundColor: teal[300], // Hover background color
                },
                boxShadow: '0px 20px 20px rgba(10, 20, 0, 0.3)'
              }}>
            <HomeIcon 
              sx= {{
                fontSize: '3em'
              }}
              onClick={()=>{navigate(CONST_PATH.home);}} // '/home'
              />
            </Avatar>
          </div>
        )}
      </>
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
              height: '8em',
              width: '8em',
              borderRadius: '50%',
              background: teal[500],
              '&:hover': {
                backgroundColor: teal[300], // Hover background color
              },
              boxShadow: '0px 20px 20px rgba(10, 20, 0, 0.3)'
            }}
            onClick={buttonClick}>
                Click Me !
        </Button>
      //</div>
    );
  };

  const ButtonLogInOutComponent = () => {

    const isLoggedIn = _currentUser != null;
    const borderRadius = isLoggedIn ? '50%' : '4px';
    const bkgrdColor = isLoggedIn ? orange[600] :indigo[600];
    const hoverBkgrdColor = isLoggedIn ? orange[400] :indigo[400];
    const buttonText = isLoggedIn ? "Log Out" : "Log In";

    const logInOutHandle = async ()=>{

      if (isLoggedIn) // call logout
      {
        await signOutUser(setCurrentUser);
        if (window.location.pathname != CONST_PATH.landing)
        {
          navigate(CONST_PATH.signInUp);
        }
      }
      else
      {
        navigate(CONST_PATH.signInUp);
      }
    }

    return (
      //<div className="text-center p-0 w-full h-20">
        <Button 
            fullWidth
            variant="contained"
            sx= {{
              //fontFamily: 'Lato',
              padding: '0px',
              fontSize: '28px',
              height: '120px',
              width: '120px',
              borderRadius: borderRadius,
              background: bkgrdColor,
              '&:hover': {
                backgroundColor: hoverBkgrdColor, // Hover background color
              },
              boxShadow: '0px 20px 20px rgba(10, 20, 100, 0.5)'
            }}
            onClick={logInOutHandle}>
                {buttonText}
        </Button>
      //</div>
    );
  };

  // Define useState
  const [items, setItems] = useState([
    { id: 3, type: 'component', component: <TextComponent displayText={displayText} /> },
    { id: 2, type: 'image', src: bkgrd3 },
    { id: 1, type: 'component', component: <ButtonLogInOutComponent /> },
    { id: 4, type: 'image', src: bkgrd2 },
    { id: 5, type: 'image', src: iconSimpleWork },
    { id: 6, type: 'image', src: bkgrd1 },
    { id: 7, type: 'component', component: <ButtonComponent buttonClick={buttonClick}/> },
    { id: 8, type: 'image', src: bkgrd7 },
    { id: 9, type: 'component', component: <TextUserComponent /> }
  ]);

  // When button click, switch the text and assign to the display
  useEffect(()=>{

    //console.log("In Display", clickIdx);
    setDisplayText(displayTextList[clickIdx]);

  }, [clickIdx]);

  // When display text change, update to the grid item
  useEffect(() => {

    //console.log("set Item " + displayText);

    setItems(prevItems => 
      prevItems.map(item => {

        if (item.type === 'component')
        {
          switch (item.id)
          {
            case 3:
              return { ...item, component: <TextComponent displayText={displayText}/> };
            case 1:
              return { ...item, component: <ButtonLogInOutComponent /> };
            case 9:
              return { ...item, component: <TextUserComponent /> };
            default:
              return item;
          }
        }
        else
        {
          return item;
        }

      }

        // item.type === 'component' && item.id === 3
        //   ? { ...item, component: <TextComponent displayText={displayText}/> }
        //   : item
      )
    );
  }, [displayText, _currentUser]);

  // Define Function, the drag Item replace the target hover item in the list
  const moveItem = (dragIndex, hoverIndex) => {
    const updatedItems = [...items];
    // const [draggedItem] = updatedItems.splice(dragIndex, 1);
    // updatedItems.splice(hoverIndex, 0, draggedItem);
    [updatedItems[dragIndex], updatedItems[hoverIndex]] = [updatedItems[hoverIndex], updatedItems[dragIndex]]
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