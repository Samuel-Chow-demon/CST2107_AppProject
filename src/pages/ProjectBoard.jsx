import { Box, Button, CircularProgress, IconButton, Paper, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect, Fragment, memo, useRef, useContext } from 'react';
import Draggable from 'react-draggable';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useProjectDB } from '../context/projectDBContext';
import { blue, grey, purple, red } from '@mui/material/colors';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {getRandomPurpleColor} from '../components/utility.js'
import ProjectFormV2 from '../components/ProjectFormV2.jsx';
import { useUserDB } from '../context/userDBContext.jsx';
import Alert from '../components/Alert.jsx';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import userContext from '../context/userContext.js';
import RemoveForm from '../components/RemoveForm.jsx';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import { CONST_PATH } from '../components/front_end_constant.js';
import { useNavigate } from 'react-router-dom';

const ProjectBoard = ({ isGridLayout, workSpaceID }) => {

  const navigate = useNavigate();
  
  const {
    workingProjects, workSpaceData, allUserInWorkSpaceDoc,
    alertProject, setAlertProject,
    isProjLoading,
    removeProject, leaveProject
  } = useProjectDB();

  //const { alertUserDB, setAlertUserDB, getUserDocData } = useUserDB();
  const { alertUserDB, setAlertUserDB } = useUserDB();
  //const [allUserInWorkSpaceDoc, setAllUserInWorkSpaceDoc] = useState([]);

  //const [isLoadedAllUser, setLoadedAllUser] = useState(false);

  const [openAddProjDialog, setOpenAddProjDialog] = useState(false);

  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [removeProjectInfo, setRemoveProjectInfo] = useState({
        projectName : "",
        projectID : "",
        creatorUID : ""});

  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [leaveProjectInfo, setLeaveProjectInfo] = useState({
    projectName: "",
    projectID: ""
  });

  const {_currentUser, setCurrentUser} = useContext(userContext);
  const [editProjectForm, setEditProjectForm] = useState({});

  // useEffect(() => {

  //   const getWorkSpaceUserDoc = async () => {
  //     setAllUserInWorkSpaceDoc(await getUserDocData(workSpaceData.userUIDs));
  //     setLoadedAllUser(true);
  //   }

  //   if (!isProjLoading)
  //   {
  //     getWorkSpaceUserDoc();
  //   }

  // }, [isProjLoading, workSpaceData])

  useEffect(() => {

    setAlertProject({ ...alertProject, message: '', isOpen: false });
    setAlertUserDB({ ...alertUserDB, message: '', isOpen: false });

  }, [])

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

  const ProjectDialog = memo(() => {

    const dialogNodeRef = useRef(null);

    return (
      <Fragment>
        <Dialog
          open={openAddProjDialog}
          onClose={() => setOpenAddProjDialog(false)}
          PaperComponent={(props) => (
            <PaperComponent {...props} nodeRef={dialogNodeRef} />
          )}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
            Create Project
          </DialogTitle>
          <DialogContent>
            <Paper style={{
              height: '100%',
              width: '500px',
              display: 'flex',
              marginTop: '10px',
              flexDirection: 'column', gap: '20px',
              justifyContent: 'center', alignItems: 'center'
            }}
              elevation={0}>

              <ProjectFormV2 allUserInWorkSpaceDoc={allUserInWorkSpaceDoc}
                              setOpenDialog={setOpenAddProjDialog}
                              currentProjectForm={editProjectForm}/>

            </Paper>
          </DialogContent>
        </Dialog>
      </Fragment >
    );
  });

  const RemoveProjectDialog = memo(() => {

    const dialogNodeRef = useRef(null);

    return (
        <Fragment>
            <Dialog
                open={openRemoveDialog}
                onClose={()=>setOpenRemoveDialog(false)}
                PaperComponent={(props) => (
                    <PaperComponent {...props} nodeRef={dialogNodeRef} />
                )}
                aria-labelledby="draggable-dialog-title"
            >
                <DialogTitle style={{ cursor: 'move', textAlign: 'center' }}
                             sx={{color:red[800]}}
                             id="draggable-dialog-title">
                    Remove Project
                </DialogTitle>
                <DialogContent>
                    <Paper style={{
                        height: '100%',
                        display: 'flex',
                        marginTop: '10px',
                        flexDirection: 'column', gap: '20px',
                        justifyContent: 'center', alignItems: 'center'
                    }}
                        elevation={0}>

                        <RemoveForm removeFromDB={()=>{removeProject({projectID:removeProjectInfo.projectID, userUID:removeProjectInfo.creatorUID})}}
                                            categoryName={'Project'}
                                            targetName={removeProjectInfo.projectName}
                                            setOpenDialog={setOpenRemoveDialog}/>

                    </Paper>
                </DialogContent>
            </Dialog>
        </Fragment >
    );
});

const proceedLeaveProject = ()=>{
  leaveProject({projectID:leaveProjectInfo.projectID, userUID:_currentUser.uid});
  setOpenLeaveDialog(false);
}

const LeaveProjectDialog = memo(() => {

  const dialogNodeRef = useRef(null);

  return (
      <Fragment>
          <Dialog
              open={openLeaveDialog}
              onClose={()=>{setOpenLeaveDialog(false)}}
              PaperComponent={(props) => (
                  <PaperComponent {...props} nodeRef={dialogNodeRef} />
              )}
              aria-labelledby="draggable-dialog-title"
          >
              <DialogTitle style={{ cursor: 'move', textAlign: 'center' }}
                           sx={{color:blue[800]}}
                           id="draggable-dialog-title">
                  Leave Project
              </DialogTitle>
              <DialogContent>
                  <Paper style={{
                      height: '100%',
                      display: 'flex',
                      marginTop: '10px',
                      flexDirection: 'column', gap: '20px',
                      justifyContent: 'center', alignItems: 'center'
                  }}
                      elevation={0}>

                      <Typography
                          sx={{color: red[600], fontSize:'20px'}}
                          >{`Sure Leave Project [${leaveProjectInfo.projectName}] ?`}</Typography>

                      <Box sx={{display:'flex', justifyContent:'space-around', alignItems:'center', border:'none', gap:2}}>
                          <Button sx={{
                                  '&:hover':{
                                      color:grey[100],
                                      backgroundColor:blue[300]
                                  }
                              }} 
                              onClick={proceedLeaveProject}>Leave</Button>
                          <Button sx={{
                                  '&:hover':{
                                      color:grey[100],
                                      backgroundColor:grey[600]
                                  }
                              }}
                              onClick={()=>{setOpenLeaveDialog(false)}}>
                              Cancel
                          </Button>
                      </Box>
                  </Paper>
              </DialogContent>
          </Dialog>
      </Fragment >
  );
});

  const navigateToProject = (projID) => {
    const path = `${CONST_PATH.home}${CONST_PATH.boardpage}/${workSpaceID}/${projID}`;
    navigate(path);
}

  const handleOpenRemoveOrLeaveProjectDialog = (proj) => {

    // If current user uid is the creator, allow Remove
    if (proj.creatorUID === _currentUser.uid) {
      setRemoveProjectInfo({
        projectName: proj.name,
        projectID: proj.id,
        creatorUID: proj.creatorUID
      });

      setOpenRemoveDialog(true);
    }
    // If not, allow leave
    else {
      setLeaveProjectInfo({
        projectName: proj.name,
        projectID: proj.id
      });

      setOpenLeaveDialog(true);
    }
  }

  const handleOpenEditOrCreateProjDialog = (proj = {})=>{

    setEditProjectForm(proj);  // empty form object means create form
    setOpenAddProjDialog(true);
  }

  const ProjectCardComponent = ({ proj })=>{
      return (
          <Box sx={{
            // display: 'flex',
            // flexDirection: 'row',
            // justifyContent: 'space-around',
            display: 'grid',
            gridTemplateColumns: '5fr 1fr',
            justifyContent:'center',
            alignItems: 'center',
            gap: 2,
            fontSize: '1rem',
            color: grey[700],
            width: '20rem',
            height: '4rem',
            cursor: 'pointer',
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
                boxshadow: 6,
                transform: 'scale(1.1)',
                borderColor: grey[300],
                backgroundColor: "#899EE9",
                color: grey[300],
                '& .icon': {
                    color: grey[300]
                }
            },
            // border: '1px solid',
            // borderColor: grey[500],
            borderRadius: '8px',
            backgroundColor: proj.projectColor ? proj.projectColor : getRandomPurpleColor()
        }}
            onClick={() => navigateToProject(proj.id)}
        >
          <Typography sx={{fontSize: '1.5rem', paddingX:'15px'}}>{proj.name}</Typography>

          <Box sx={{
            display : 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginRight: '10px',
            gap: 1,
            width: 'auto'
          }}>

            <HtmlTooltip
              title={
                <Fragment>
                  <Typography sx={{
                    color: grey[600]
                  }}>Edit</Typography>
                </Fragment>
              }
            >
              <IconButton style={{
                width: 40, height: 40, padding: 2,
                backgroundColor: grey[200], opacity: 0.8
              }}
                sx={{
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    boxshadow: 6,
                    transform: 'scale(1.3)'
                  }
                }}
                aria-label="edit" size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditOrCreateProjDialog(proj);
                }}>
                <BorderColorIcon  fontSize="inherit" />
                
              </IconButton>
            </HtmlTooltip>

            <HtmlTooltip
              title={
                <Fragment>
                  <Typography sx={{
                    color: (proj.creatorUID == _currentUser.uid) ? red[400] : grey[600]
                  }}>{`${proj.creatorUID == _currentUser.uid ? "Remove" : "Leave"} ${name}`}</Typography>
                </Fragment>
              }
            >
              <IconButton style={{
                width: 40, height: 40, padding: 2,
                backgroundColor: grey[200], opacity: 0.8
              }}
                sx={{
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    boxshadow: 6,
                    transform: 'scale(1.3)'
                  }
                }}
                aria-label="delete" size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenRemoveOrLeaveProjectDialog(proj)
                }}>
                {
                  (proj.creatorUID == _currentUser.uid) ? <DeleteForeverIcon fontSize="inherit" /> : <ExitToAppIcon fontSize="inherit" />
                }
              </IconButton>
            </HtmlTooltip>
          </Box>


        </Box>


      );
  }

  return (
    <>
      {//(isProjLoading || !isLoadedAllUser) ?
        (isProjLoading) ?
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: workSpaceData.bkgrdColor,
            backgroundImage: workSpaceData.img ? `url(${workSpaceData.img})` : 'none',
            width: '100%',
            height: '100%',
            padding: '20px'
        }}>
            <CircularProgress sx={{ size: 50 }} />
        </Box>
        :
        <>
          <ProjectDialog />
          <RemoveProjectDialog />
          <LeaveProjectDialog />
          <Alert alertConfig={alertProject} />
          <Alert alertConfig={alertUserDB} />
          <Box
            style={{
              backgroundColor: workSpaceData.bkgrdColor,
              backgroundImage: workSpaceData.img ? `url(${workSpaceData.img})` : 'none',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              height: '100%',
              width: '100%'
            }}
          >
            <Box sx={{
                      display: 'grid',
                      gridAutoFlow: "column",
                      gridTemplateRows: "repeat(auto-fill, minmax(80px, 1fr))",
                      width: 'auto',
                      height: '100%',
                      gap: 0,
                      padding: 4
                  }}>
              
              <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: '1.5rem',
                    color: grey[700],
                    width: '20rem',
                    height: '4rem',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        boxshadow: 6,
                        transform: 'scale(1.1)',
                        borderColor: grey[300],
                        backgroundColor: "#899EE9",
                        color: grey[300],
                        '& .icon': {
                            color: grey[300]
                        }
                    },
                    border: '2px solid',
                    borderColor: grey[500],
                    borderRadius: '8px',
                    backgroundColor: "#C5CAE9"
                }}
                    onClick={()=>handleOpenEditOrCreateProjDialog()}
                >
                    Add Project
                    <AddCircleIcon className="icon" sx={{
                        fontSize: 40,
                        color: grey[700]
                    }}
                    />
                </Box>

                {
                  workingProjects.length > 0 &&
                  workingProjects
                      .filter((proj)=>proj.memberUIDs.includes(_currentUser.uid))
                      .map((proj, index) => {
                      return <ProjectCardComponent key={index}
                          proj={proj}
                          />
                  })
                }
                    
            </Box>
          </Box>
        </>
      }
    </>
  );
};

export default memo(ProjectBoard);
