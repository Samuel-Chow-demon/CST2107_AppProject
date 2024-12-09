import { Box, Button, CircularProgress, IconButton, Paper, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect, Fragment, memo, useRef, useContext } from 'react';
import Draggable from 'react-draggable';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { blue, grey, purple, red } from '@mui/material/colors';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {getRandomPurpleColor} from '../components/utility.js'
import { useUserDB } from '../context/userDBContext.jsx';
import Alert from '../components/Alert.jsx';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import userContext from '../context/userContext.js';
import RemoveForm from '../components/RemoveForm.jsx';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import AddIcon from '@mui/icons-material/Add';
import { useStateDB } from '../context/stateDBContext.jsx';
import StateForm from '../components/StateForm.jsx';
//import NestedDraggableGrid from '../components/NestedDraggableGrid.jsx';
import { useTaskDB } from '../context/taskDBContext.jsx';
import NestedDraggableGrid_V2 from '../components/NestedDraggableGrid_V2.jsx';
import { CommentDBProvider } from '../context/commentDBContext.jsx';

const StateBoard = ({ isGridLayout, workSpaceDataWithID }) => {

    // workingStatesWithTasks would in the structure as 
    // [{
    //     id:state_1_id, ...doc.data(), tasks : [{id:task_1_id, ...taskDoc.data()}, {id:task_2_id, ...taskDoc.data()}]   
    //  },
    //  {
    //     id:state_2_id, ...doc.data(), tasks : [{id:task_1_id, ...taskDoc.data()}, {id:task_2_id, ...taskDoc.data()}]   
    //  }
    //  ...
    // ]
    const {
        workingStatesWithTasks, setworkingStatesWithTasks,
        projectData, allUserInProjectDoc,
        alertState, setAlertState,
        isStateLoading, setStateIsLoading,
        createState, joinState, removeState, leaveState, editState, leaveJoinState
    } = useStateDB();

    const {
        alertTask, setAlertTask
    } = useTaskDB();

    //const { alertUserDB, setAlertUserDB, getUserDocData } = useUserDB();
    const { alertUserDB, setAlertUserDB } = useUserDB();

    //const [allUserInProjectDoc, setAllUserInProjectDoc] = useState([]);
    //const [isLoadedAllUser, setLoadedAllUser] = useState(false);

    const [taskFormOpen, setTaskFormOpen] = useState(false);

    const {_currentUser, setCurrentUser} = useContext(userContext);

    // useEffect(() => {

    //     const getProjectUserDoc = async () => {
    //         setAllUserInProjectDoc(await getUserDocData(projectData.memberUIDs));
    //         setLoadedAllUser(true);
    //     }
    
    //     if (projectData?.memberUIDs)
    //     {
    //         setAllUserInProjectDoc(userInProjectList);
    //     }
    
    // }, [projectData?.memberUIDs])

    useEffect(() => {

        setAlertState({ ...alertState, message: '', isOpen: false });
        setAlertTask({ ...alertTask, message: '', isOpen: false });
        setAlertUserDB({ ...alertUserDB, message: '', isOpen: false });

    }, []);

    return (
        <>
            {
                //(isStateLoading || !isLoadedAllUser) ?
                (isStateLoading) ?
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: workSpaceDataWithID.bkgrdColor,
                    backgroundImage: workSpaceDataWithID.img ? `url(${workSpaceDataWithID.img})` : 'none',
                    width: '100%',
                    height: '100%',
                    padding: '20px'
                }}>
                    <CircularProgress sx={{ size: 50 }} />
                </Box>
                :
                <>
                    <Alert alertConfig={alertState} />
                    <Alert alertConfig={alertTask} />
                    <Alert alertConfig={alertUserDB} />
                    <CommentDBProvider>
                        <Box
                            style={{
                                backgroundColor: workSpaceDataWithID.bkgrdColor,
                                backgroundImage: workSpaceDataWithID.img ? `url(${workSpaceDataWithID.img})` : 'none',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'center',
                                height: '100%',
                                width: '100%',
                                // display: 'grid',
                                // gridAutoFlow: 'column',
                                // gridTemplateColumns: 'auto auto',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '20px',
                                overflowX: 'auto', // Enable horizontal scrolling
                                //overflowY: 'hidden', // Prevent vertical overflow
                            }}>

                            <NestedDraggableGrid_V2 stateCards={workingStatesWithTasks}
                                                    setStateCards={setworkingStatesWithTasks}
                                                    allUserInProjectDoc={allUserInProjectDoc}/>

                            {
                                taskFormOpen ?
                                <Box sx={{height: '20%', width : 'auto', marginLeft: workingStatesWithTasks.length > 0 ? '2rem' : '1rem'}}>
                                    <StateForm projectID={projectData.id} setFormOpen={setTaskFormOpen} />
                                    
                                </Box> 
                                :
                                <Button
                                    onClick={()=>setTaskFormOpen(true)}
                                    sx={{
                                        padding: "1rem",
                                        marginLeft: '1rem',
                                        minWidth: '15rem',
                                        border: "2px dashed #3a34eb",
                                        backgroundColor: "transparent",
                                        color: "#3a34eb",
                                        cursor: "pointer",
                                        borderRadius: "8px",
                                        fontSize: "22px",
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            boxshadow: 6,
                                            transform: 'scale(1.1)',
                                            borderColor: "#7f2bc4",
                                            color: "#7f2bc4",
                                            '& .icon': {
                                                color: "#7f2bc4"
                                            }
                                        },
                                    }}
                                >
                                <AddIcon className="icon" sx={{
                                            fontSize: 32,
                                            color: "#3a34eb"
                                    }}
                                    />
                                    Add State
                                </Button>
                            }
                        </Box>
                    </CommentDBProvider>
                </>
            }
        </>
    );
}

export default memo(StateBoard);