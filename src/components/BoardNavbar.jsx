import React, { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';
import './BoardNavbar.css';
import BoardMenu from './BoardMenu';  // Import the sidebar menu
import { FullscreenExit } from '@mui/icons-material';
import { useUserDB } from '../context/userDBContext';
import Alert from './Alert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box, Button, Dialog, DialogContent, DialogTitle, Paper } from '@mui/material';
import { blue, green, grey } from '@mui/material/colors';
import AddUserToWorkSpaceForm from './AddUserToWorkSpaceForm';
import Draggable from 'react-draggable';
import { useWorkSpaceDB } from '../context/workspaceDBContext';
import userContext from '../context/userContext';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';

// if projectDataWithID = {} means navbar is at the workspace board
const BoardNavbar = ({ toggleLayout, isGridLayout, workSpaceDataWithID,
                        projectDataWithID = {} }) => {

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [allUserDoc, setAllUserDoc] = useState([]);
  const [isLoadedAllUser, setLoadedAllUser] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const {_currentUser, setCurrentUser} = useContext(userContext);

  const { alertUserDB, setAlertUserDB, getAllUserDoc, getUserDocData } = useUserDB()
  const { alertWorkSpace, setAlertWorkSpace } = useWorkSpaceDB();

  const [allUserInWorkSpaceDoc, setAllUserInWorkSpaceDoc] = useState([]);

  const isAtWorkSpaceBoard = Object.keys(projectDataWithID).length == 0;

  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  useEffect(() => {

    const getAllUserDBDoc = async () => {
      if (workSpaceDataWithID)
      {
        setAllUserDoc(await getAllUserDoc());
        setAllUserInWorkSpaceDoc(await getUserDocData(workSpaceDataWithID.userUIDs));
        setLoadedAllUser(true);
      }
    }

    setAlertUserDB({ ...alertUserDB, message: '', isOpen: false });
    setAlertWorkSpace({ ...alertWorkSpace, message: '', isOpen: false });
    getAllUserDBDoc();

  }, [workSpaceDataWithID])

  const PaperComponent = memo(({ nodeRef, ...props }) => {
    return (
      <Draggable nodeRef={nodeRef}
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper ref={nodeRef} sx={{ borderRadius: '8px' }} {...props} />
      </Draggable>
    );
  });

  const AddUserDialog = memo(() => {

    const dialogNodeRef = useRef(null);

    return (
      <Fragment>
        <Dialog
          open={openAddUserDialog}
          onClose={() => setOpenAddUserDialog(false)}
          PaperComponent={(props) => (
            <PaperComponent {...props} nodeRef={dialogNodeRef} />
          )}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
            Add Users
          </DialogTitle>
          <DialogContent>
            <Paper style={{
              height: '100%',
              width: '30rem',
              display: 'flex',
              marginTop: '10px',
              flexDirection: 'column', gap: '20px',
              justifyContent: 'center', alignItems: 'center'
            }}
              elevation={0}>

              <AddUserToWorkSpaceForm allUserDocs={allUserDoc} creatorUID={workSpaceDataWithID.creatorUID}
                                      workspaceID={workSpaceDataWithID.id} setOpenDialog={setOpenAddUserDialog} uid={_currentUser.uid}
                                      allUserInWorkSpaceDoc={allUserInWorkSpaceDoc} />

            </Paper>
          </DialogContent>
        </Dialog>
      </Fragment >
    );
  });

  return (
    <>
      <nav className="board-navbar">
        <AddUserDialog />
        <Button variant="contained" startIcon={<ArrowBackIosIcon />}
          sx={{
            fontSize: '14px',
            marginX: '2rem',
            width: 'auto',
            backgroundColor: blue[700],
            color: grey[200],
            '&:hover': {
              backgroundColor: blue[300],
              color: grey[800]
            }
          }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <h1 className="board-title">{isAtWorkSpaceBoard ? workSpaceDataWithID.name : `Project : ${projectDataWithID.name}`}</h1>

        {
          isLoadedAllUser && isAtWorkSpaceBoard &&
          <Button variant="contained" endIcon={<AddCircleOutlineIcon />}
            sx={{
              fontSize: '14px',
              marginLeft: '5rem',
              backgroundColor: green[700],
              color: grey[200],
              '&:hover': {
                backgroundColor: green[300],
                color: grey[800]
              }
            }}
            onClick={() => setOpenAddUserDialog(true)}
          >
            Add Users
          </Button>
        }

        <Box sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          flexGrow: 1
        }}>
          <div className="navbar-controls">
            {/* Toggle Layout button */}
            <button className="toggle-layout-btn" onClick={toggleLayout}>
              {isGridLayout ? 'Switch to Row Layout' : 'Switch to Grid Layout'}
            </button>
            {/* Menu button on the right */}
            <button className="menu-btn"
              onClick={toggleMenu}>
              &#x22EE; {/* Vertical ellipsis icon for menu */}
            </button>
          </div>
        </Box>
      </nav>
      <Alert alertConfig={alertUserDB} />
      <Alert alertConfig={alertWorkSpace} />
      {/* Sidebar */}
      <BoardMenu isOpen={isMenuOpen} closeMenu={toggleMenu} />
    </>
  );
};

export default BoardNavbar;
