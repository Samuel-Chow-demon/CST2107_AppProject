
import {useState, useEffect, useContext, useRef, memo} from 'react'
import {Avatar, Button} from '@mui/material';
import { teal, indigo, orange } from '@mui/material/colors'; // Import color palette

import { createSwapy } from 'swapy';

import bkgrd1 from '../assets/bkgrd1.webp'
import bkgrd2 from '../assets/bkgrd2.webp'
import bkgrd3 from '../assets/bkgrd3.webp'
import bkgrd7 from '../assets/bkgrd7.webp'
import iconSimpleWork from '../assets/SimpleWorkSmallWhitebkg.svg'

import './Landing.css';
import { useNavigate } from 'react-router-dom';
import { CONST_PATH } from '../components/front_end_constant';
import { signOutUser } from '../components/utility';
import userContext from '../context/userContext.js'

import WarehouseIcon from '@mui/icons-material/Warehouse';
import { useUserDB } from '../context/userDBContext.jsx';

// GridItem component
const GridItemV2 = memo(({ id, item }) => {
  
  return (
    <>
      {item.type === 'image' ? (
        <img src={item.src} alt="Grid item" className="grid-image" id={`id-grid-item-${id}`}/>
      ) : (
        <div className="grid-component flex justify-center items-center" id={`id-grid-item-${id}`}>{item.component}</div>
      )}
    </>
  );
});

const LandingPage = () => {

  const navigate = useNavigate();

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const displayTextList = ['Simple Work .\nWork Simple',
                            `Today is ${(new Date()).toLocaleDateString()}`,
                            "Manage Work .\nDrag and Drop",
                            "{ Drag Me }"
  ];

  const [clickIdx, setClickIdx] = useState(0);
  const [displayText, setDisplayText] = useState(displayTextList[0]);

  const { updateUserDB } = useUserDB();

  const swapy = useRef(null);
  const swapyContainer = useRef(null);

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
        {_currentUser?.loggedIn && (
            <div className="text-center p-5 flex justify-center items-center">
            <p style={{ whiteSpace: 'pre-line',
                        fontSize: '2.5rem',
                        fontWeight: '600',
                        color: 'purple',
                        marginRight: '1rem'}}>{textUserDisplay}</p>
            <Avatar 
                sx= {{
                borderRadius: '50%',
                margin: '0px 0px 0px 25px',
                width: '4em',
                height: '4em',
                background: teal[500],
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  backgroundColor: teal[300], // Hover background color
                  boxshadow: 6,
                  transform: 'scale(1.3)'
                },
                boxShadow: '0px 20px 20px rgba(10, 20, 0, 0.3)'
              }}>
            <WarehouseIcon 
              sx= {{
                fontSize: '2.5em'
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
              padding: '20px 20px',
              fontSize: '20px',
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

    const isLoggedIn = _currentUser != null && _currentUser.loggedIn;
    const borderRadius = isLoggedIn ? '50%' : '10px';
    const bkgrdColor = isLoggedIn ? orange[600] :indigo[600];
    const hoverBkgrdColor = isLoggedIn ? orange[400] :indigo[400];
    const buttonText = isLoggedIn ? "Log Out" : "Log In";

    const logInOutHandle = async ()=>{

      if (isLoggedIn) // call logout
      {
        await signOutUser(setCurrentUser, updateUserDB, _currentUser.uid);
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
              padding: '15px 15px',
              fontSize: '20px',
              height: '7em',
              width: '7em',
              borderRadius: borderRadius,
              background: bkgrdColor,
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                backgroundColor: hoverBkgrdColor, // Hover background color
                boxshadow: 6,
                transform: 'scale(1.1)'
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

  useEffect(()=>{

    if (swapyContainer.current)
    {
      swapy.current = createSwapy(swapyContainer.current);
    }

    return()=>{
      swapy.current?.destroy();
    }

  }, []);

  return (
    <div className="flex justify-center items-center h-screen p-20">
      
      <div ref={swapyContainer}
      >
        
        <div className="grid-container">

          {
            items.map((item, index)=>(

              <div key={index} data-swapy-slot={item.id}>
                <div data-swapy-item={item.id}>
                  <GridItemV2 id={item.id} item={item}/>
                </div>
              </div>

            ))
          }

        </div>
      </div>

    </div>
  )
}

export default LandingPage