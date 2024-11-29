import { forwardRef, Fragment, memo, useContext, useEffect, useRef, useState } from 'react'
import { useWorkSpaceDB, WorkSpaceDBProvider } from '../context/workspaceDBContext'
import { styled } from '@mui/material/styles';
import { Box, Button, Card, CardContent, CardMedia, CircularProgress, IconButton, Paper, TextField, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { grey, purple, blue, red } from '@mui/material/colors';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Alert from '../components/Alert';
import Draggable from 'react-draggable';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CreateWorkSpaceForm from '../components/CreateWorkSpaceForm';
import userContext from '../context/userContext';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import RemoveWorkSpaceForm from '../components/RemoveWorkSpaceForm';
import { useNavigate } from 'react-router-dom';
import { CONST_PATH } from '../components/front_end_constant';

const WorkSpaceBoard = () => {

    const [openDialog, setOpenDialog] = useState(false);

    const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
    const [removeWorkSpaceInfo, setRemoveWorkSpaceInfo] = useState({
        workspaceName : "",
        workspaceID : "",
        creatorUID : ""});

    const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
    const [leaveWorkSpaceInfo, setLeaveWorkSpaceInfo] = useState({
        workspaceName : "",
        workspaceID : ""});
   

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const {
        workingWorkSpace, alertWorkSpace, setAlertWorkSpace,
        isWSLoading,
        createWorkSpace, joinWorkSpace, removeWorkSpace, leaveWorkSpace } = useWorkSpaceDB();

    // const WorkSpaceFormComponents = useCreateWorkSpaceForm({createWorkSpace, setOpenDialog});

    const navigate = useNavigate();

    useEffect(()=>{
        setAlertWorkSpace({...alertWorkSpace, message:'', isOpen: false});
    }, [])

    const navigateToWorkSpace = (id) => {
        const path = `${CONST_PATH.home}${CONST_PATH.boardpage}/${id}`;
        navigate(path);
    }

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

    const WorkSpaceDialog = memo(() => {

        const dialogNodeRef = useRef(null);

        return (
            <Fragment>
                <Dialog
                    open={openDialog}
                    onClose={()=>setOpenDialog(false)}
                    PaperComponent={(props) => (
                        <PaperComponent {...props} nodeRef={dialogNodeRef} />
                    )}
                    aria-labelledby="draggable-dialog-title"
                >
                    <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
                        Create Workspace
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

                            <CreateWorkSpaceForm createWorkSpaceDB={createWorkSpace} setOpenDialog={setOpenDialog} />

                        </Paper>
                    </DialogContent>
                </Dialog>
            </Fragment >
        );
    });

    const RemoveWorkSpaceDialog = memo(() => {

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
                        Remove Workspace
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

                            <RemoveWorkSpaceForm removeWorkSpaceDB={removeWorkSpace} setOpenDialog={setOpenRemoveDialog}
                                                 workspaceName={removeWorkSpaceInfo.workspaceName} 
                                                 workspaceID={removeWorkSpaceInfo.workspaceID} 
                                                 creatorUID={removeWorkSpaceInfo.creatorUID}/>

                        </Paper>
                    </DialogContent>
                </Dialog>
            </Fragment >
        );
    });

    const proceedLeaveWorkSpace = ()=>{
        leaveWorkSpace({workspaceID:leaveWorkSpaceInfo.workspaceID, userUID:_currentUser.uid});
        setOpenLeaveDialog(false);
    }

    const LeaveWorkSpaceDialog = memo(() => {

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
                        Leave Workspace
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
                                >{`Sure Leave Project [${leaveWorkSpaceInfo.workspaceName}] ?`}</Typography>

                            <Box sx={{display:'flex', justifyContent:'space-around', alignItems:'center', border:'none', gap:2}}>
                                <Button sx={{
                                        '&:hover':{
                                            color:grey[100],
                                            backgroundColor:blue[300]
                                        }
                                    }} 
                                    onClick={proceedLeaveWorkSpace}>Leave</Button>
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

    //leaveWorkSpace({workspaceID:id, userUID:_currentUser.uid})

    const handleOpenRemoveOrLeaveWorkSpaceDialog = ({ id, workspaceName, creatorUID})=>{

        // If current user uid is the creator, allow Remove
        if (creatorUID === _currentUser.uid)
        {
            setRemoveWorkSpaceInfo({
                workspaceName : workspaceName,
                workspaceID : id,
                creatorUID : creatorUID});

            setOpenRemoveDialog(true);
        }
        // If not, allow leave
        else
        {
            setLeaveWorkSpaceInfo({
                workspaceName : workspaceName,
                workspaceID : id});

            setOpenLeaveDialog(true);
        }
    }

    const ProjectCardComponent = ({ id, name, bkgrdColor, img, creatorUID }) => {

        return (
            <>
                <Card sx={{
                    position: 'relative',
                    width: '15rem',
                    height: '15rem',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                        boxshadow: 6,
                        transform: 'scale(1.1)'
                    }
                    }}
                    onClick={() => navigateToWorkSpace(id)}
                    >

                    <HtmlTooltip
                            title={
                                <Fragment>
                                    <Typography sx={{
                                        color:(creatorUID == _currentUser.uid) ? red[400] : grey[600]
                                    }}>{`${creatorUID == _currentUser.uid ? "Remove" : "Leave"} ${name}`}</Typography>
                                </Fragment>
                            }
                        >
                        <IconButton style={{ position: 'absolute', right: '10px', top: '10px', width: 40, height: 40, padding: 2,
                                            backgroundColor:grey[200], opacity:0.8}}
                                    sx={{  
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            boxshadow: 6,
                                            transform: 'scale(1.3)'
                                        }}}
                            aria-label="delete" size="large"
                            onClick={() => {handleOpenRemoveOrLeaveWorkSpaceDialog({ id:id, workspaceName:name, creatorUID:creatorUID }) }}>
                            {
                                (creatorUID == _currentUser.uid) ? <DeleteForeverIcon fontSize="inherit" /> : <ExitToAppIcon fontSize="inherit" />
                            }
                        </IconButton>
                    </HtmlTooltip>

                    <Box
                        sx={{
                            height: '70%',
                            backgroundColor: bkgrdColor,
                            backgroundImage: img ? `url(${img})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                    <CardContent>
                        {/* <Typography gutterBottom variant="h5" component="div">
                            Project
                        </Typography> */}
                        <Typography gutterBottom variant="h5" sx={{ color: 'text.secondary' }}>
                            {name}
                        </Typography>
                    </CardContent>
                </Card>
            </>);
    }

    return (
        <>
            {isWSLoading ?
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: purple[50],
                    width: '100%',
                    height: '100%',
                    padding: '20px'
                }}>
                    <CircularProgress sx={{ size: 50 }} />
                </Box>
                :
                <>
                    <WorkSpaceDialog />
                    <RemoveWorkSpaceDialog />
                    <LeaveWorkSpaceDialog />
                    <Box sx={{
                            backgroundColor: purple[50],
                            width: '100%',
                            height: '100%',
                            padding: '20px'
                        }}>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 17rem)',
                            width: 'auto',
                            height: 'auto',
                            gap: 3
                        }}>

                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 2,
                                fontSize: '1.5rem',
                                color: grey[500],
                                width: '15rem',
                                height: '15rem',
                                cursor: 'pointer',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    boxshadow: 6,
                                    transform: 'scale(1.1)',
                                    borderColor: grey[700],
                                    color: grey[700],
                                    '& .icon': {
                                        color: grey[700]
                                    }
                                },
                                border: '4px solid',
                                borderColor: grey[500],
                                borderRadius: '8px'
                            }}
                                onClick={()=>setOpenDialog(true)}
                            >
                                Add WorkSpace
                                <AddCircleIcon className="icon" sx={{
                                    fontSize: 50,
                                    color: grey[500]
                                }}
                                />
                            </Box>

                            {
                                workingWorkSpace.length > 0 &&
                                workingWorkSpace.map((ws, index) => {
                                    return <ProjectCardComponent key={index}
                                        id={ws.id}
                                        creatorUID={ws.creatorUID}
                                        name={ws.name}
                                        bkgrdColor={ws.bkgrdColor}
                                        img={ws.img} />
                                })

                            }
                            <Alert alertConfig={alertWorkSpace} />
                        </Box>
                    </Box>
                </>
            }
        </>
    )
}

export default WorkSpaceBoard