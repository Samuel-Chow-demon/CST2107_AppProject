import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Avatar, Box, Button, Dialog, DialogContent, DialogTitle, Paper, styled, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { blue, green, grey } from '@mui/material/colors';
import { onSnapshot } from 'firebase/firestore';
import { Fragment, memo, useContext, useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import userContext from '../context/userContext';
import { useUserDB } from '../context/userDBContext';
import { useWorkSpaceDB } from '../context/workspaceDBContext';
import { userCollectionRef } from '../fireStore/database.js';
import AddUserToWorkSpaceForm from './AddUserToWorkSpaceForm';
import Alert from './Alert';
import './BoardNavbar.css';

// if projectDataWithID = {} means navbar is at the workspace board
const BoardNavbar = ({ toggleLayout, isGridLayout, workSpaceDataWithID,
                        projectDataWithID = {} }) => {

  const [allUserDoc, setAllUserDoc] = useState([]);
  const [isLoadedAllUser, setLoadedAllUser] = useState(false);
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const {_currentUser, setCurrentUser} = useContext(userContext);

  const { alertUserDB, setAlertUserDB, getAllUserDoc, getUserDocData } = useUserDB()
  const { alertWorkSpace, setAlertWorkSpace } = useWorkSpaceDB();

  const [allUserInWorkSpaceDoc, setAllUserInWorkSpaceDoc] = useState([]);

  const isAtWorkSpaceBoard = Object.keys(projectDataWithID).length == 0;

  const navigate = useNavigate();

  const extractAllWorkSpaceUserDoc = async()=>{
    setAllUserInWorkSpaceDoc(await getUserDocData(workSpaceDataWithID.userUIDs));
  }

  useEffect(() => {

    const getAllUserDBDoc = async () => {
      if (workSpaceDataWithID)
      {
        setAllUserDoc(await getAllUserDoc());
        extractAllWorkSpaceUserDoc();
        setLoadedAllUser(true);
      }
    }

    setAlertUserDB({ ...alertUserDB, message: '', isOpen: false });
    setAlertWorkSpace({ ...alertWorkSpace, message: '', isOpen: false });
    getAllUserDBDoc();

  }, [workSpaceDataWithID]);

  useEffect(()=>{

    let unsubscribeUserCol = null;

    if (unsubscribeUserCol)
    {
      unsubscribeUserCol();
    }

    unsubscribeUserCol = onSnapshot(
      userCollectionRef,
      (snapshot)=>extractAllWorkSpaceUserDoc(),
      (error) => {
          console.error("Real-time Listening User Doc DB Fail", error);
          setAlertUserDB({
              ...alertUserDB,
              message: 'Real-time Listening User Doc DB Fail',
              color: 'error',
              isOpen: true,
              hideDuration: 2000,
          });
      }
    );

    return () => unsubscribeUserCol();
  }, [])

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
                                      workspaceID={workSpaceDataWithID.id} setOpenDialog={setOpenAddUserDialog} uid={_currentUser?.uid ?? ""}
                                      allUserInWorkSpaceDoc={allUserInWorkSpaceDoc} />

            </Paper>
          </DialogContent>
        </Dialog>
      </Fragment >
    );
  });

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: grey[100], //'#f5f5f9',
      color: 'rgba(0, 0, 0, 0.9)',
      maxWidth: 150,
      fontSize: theme.typography.pxToRem(12),
      border: '0px solid',
    },
  }));

  const UserOnlineStatus = ()=>{

    const getShortName = (userName)=>{
      return (userName.at(0) + userName.at(-1)).toUpperCase();
    }

    const onLineUser = allUserInWorkSpaceDoc.filter((userDoc)=>userDoc.loggedIn === true);
    const offLineUser = allUserInWorkSpaceDoc.filter((userDoc)=>userDoc.loggedIn !== true);

    return(
      <>
        {
          allUserInWorkSpaceDoc &&
          (
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', marginLeft:'1rem'}}>
              
              {
                onLineUser.length > 0 &&
                  <Box sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                    <Typography sx={{marginRight:'5px'}}>online:</Typography>
                    {
                      onLineUser.map((userDoc, index)=>{
                        return (
                          <HtmlTooltip
                              key={index}
                              title={
                                  <Fragment>
                                      <Typography sx={{
                                          color: grey[600]
                                      }}>{userDoc?.userName ?? 'N/A'}</Typography>
                                  </Fragment>
                              }
                          >
                            <Avatar key={index} sx={{ bgcolor: userDoc.color ? userDoc.color : 'white' }}>{getShortName(userDoc.userName)}</Avatar>
                          </HtmlTooltip>
                        );
                      })
                    }
                  </Box>
              }
              {
                offLineUser.length > 0 &&
                  <Box sx={{display:'flex', justifyContent:'center', alignItems:'center', marginLeft:'1rem'}}>
                    <Typography sx={{marginRight:'5px'}}>offline:</Typography>
                    {
                      offLineUser.map((userDoc, index)=>{
                        return (
                          <HtmlTooltip
                              key={index}
                              title={
                                  <Fragment>
                                      <Typography sx={{
                                          color: grey[600]
                                      }}>{userDoc?.userName ?? 'N/A'}</Typography>
                                  </Fragment>
                              }
                          >
                            <Avatar key={index} sx={{ bgcolor: 'grey' }}>{getShortName(userDoc.userName)}</Avatar>
                          </HtmlTooltip>
                        );
                      })
                    }
                  </Box>
              }
            </Box>
          )
        }
      </>
    );
  }

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

        <UserOnlineStatus />


      </nav>
      <Alert alertConfig={alertUserDB} />
      <Alert alertConfig={alertWorkSpace} />
    </>
  );
};

export default BoardNavbar;
