import React, { useContext } from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, AccountCircle, Logout } from '@mui/icons-material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import iconSimpleWork from '../assets/SimpleWorkSmall.svg'
import { useNavigate } from 'react-router-dom';
import { CONST_PATH } from './front_end_constant';
import userContext from '../context/userContext';
import { signOutUser } from './utility';
import { indigo } from '@mui/material/colors';

function Sidebar() {

    const navigate = useNavigate();

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const ListItemComponent = ({IconComponent, itemText, buttonClick = ()=>{}})=>{

        return (
            <ListItem disablePadding>
                <ListItemButton component="a" href="#"
                    onClick={buttonClick}
                    sx={{ 
                        transition: 'transform 0.2s ease-in', 
                        '&:hover': { transform: 'translateX(8px)' } 
                        }}>
                    <ListItemIcon>
                        {IconComponent}
                    </ListItemIcon>
                    <ListItemText 
                        primary={itemText} 
                        primaryTypographyProps={{ 
                                                fontSize: '1.25rem', 
                                                color: 'text.secondary' 
                                                }} />
                </ListItemButton>
            </ListItem>
        );
    };

    const logOutHandle = async ()=>{

        await signOutUser(setCurrentUser);
        navigate(CONST_PATH.signInUp);
    }


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '256px',
        minWidth: '256px',
        height: '100%',
        bgcolor: 'white',
        // borderRadius: '0 24px 24px 0',
        overflow: 'hidden'
      }}
    >
      {/* Logo Box */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: indigo[100],
          height: '79px',
          boxShadow: 1,
          overflow: 'hidden'
        }}
      >
        <img src={iconSimpleWork} alt="" style={{ marginRight: 8, height: '310%'}} />
        {/* <Typography variant="h4" color="orange" sx={{ textTransform: 'uppercase', marginRight: 1 }}>
          Simple Work
        </Typography>
        <Typography variant="h4" color="error" sx={{ textTransform: 'uppercase', marginRight: 3 }}>
          Work Simple
        </Typography> */}
      </Box>

      {/* Menu List */}
      <List sx={{ py: 3 }}>


        <ListItemComponent 
            IconComponent={<Dashboard fontSize="large" sx={{ color: '#6d727e' }} />}
            itemText={"Workspace"}
            buttonClick={()=>navigate(CONST_PATH.home + CONST_PATH.workspace)}
        />
        <ListItemComponent 
            IconComponent={<WeekendIcon fontSize="large" sx={{ color: '#6c727f' }} />}
            itemText={"Lounge"}
            buttonClick={()=>navigate(CONST_PATH.home + CONST_PATH.lounge)}
        />
        <ListItemComponent 
            IconComponent={<AccountCircle fontSize="large" sx={{ color: '#6e727d' }} />}
            itemText={"Profile"}
            buttonClick={()=>navigate(CONST_PATH.home + CONST_PATH.userProfile)}
        />
        <ListItemComponent 
            IconComponent={<Logout fontSize="large" sx={{ color: '#6f727c' }} />}
            itemText={"Logout"}
            buttonClick={logOutHandle}
        />
       
      </List>
    </Box>
  ); 
}

export default Sidebar
