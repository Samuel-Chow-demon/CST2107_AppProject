import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Dashboard, AccountCircle, Logout } from '@mui/icons-material';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import { useLogInOutClick } from '../components/utility';
import iconSimpleWork from '../assets/SimpleWorkSmall.svg'

function Sidebar() {

    const [loggedInUserName, setLoggedInUserName, actionLogInOut] = useLogInOutClick('logout');

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


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 256,
        minWidth: 256,
        height: '100%',
        bgcolor: 'white',
        borderRadius: '0 24px 24px 0',
        overflow: 'hidden'
      }}
    >
      {/* Logo Box */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 80,
          boxShadow: 1
        }}
      >
        <img src={iconSimpleWork} alt="" style={{ marginRight: 8, height: '300%' }} />
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
            itemText={"Dashboard"}
            // buttonClick={}
        />
        <ListItemComponent 
            IconComponent={<ControlPointIcon fontSize="large" sx={{ color: '#6c727f' }} />}
            itemText={"Add WorkSpace"}
            // buttonClick={}
        />
        <ListItemComponent 
            IconComponent={<AccountCircle fontSize="large" sx={{ color: '#6e727d' }} />}
            itemText={"Profile"}
            // buttonClick={}
        />
        <ListItemComponent 
            IconComponent={<Logout fontSize="large" sx={{ color: '#6f727c' }} />}
            itemText={"Logout"}
            buttonClick={actionLogInOut}
        />
       
      </List>
    </Box>
  ); 
}

export default Sidebar
