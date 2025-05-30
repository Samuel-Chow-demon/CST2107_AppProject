import { Fragment, memo, useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button, IconButton, Paper, Typography } from '@mui/material';
import { blue, grey, red } from '@mui/material/colors';
import RemoveForm from './RemoveForm';
import { useStateDB } from '../context/stateDBContext';
import ReactDraggable from 'react-draggable';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TaskFormV2 from './TaskFormV2';
import StateForm_V2 from './StateForm_V2';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useTaskDB } from '../context/taskDBContext';
import { useCommentDB } from '../context/commentDBContext';
import Alert from '../components/Alert.jsx';

const TaskCardComponent = ({ task, provided, index, snapshot,
                             onClickOpenAddOrEditTask }) => (
  <div
    style={{
      padding: "8px",
      marginBottom: "8px",
      backgroundColor: "#e0e0e0",
      borderRadius: "4px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      ...provided.draggableProps.style,
    }}
    onDoubleClick={()=>onClickOpenAddOrEditTask(task)} // open current Task Form
  >
    {task.title}
  </div>
);

const StateCardComponent = memo(({ state, stateIndex, snapshot,

                              allUserInProjectDoc
                            
                            }) => {

  const [openStateForm, setOpenStateForm] = useState(false);

  const [currentEditTaskForm, setCurrentEditTaskForm] = useState({});

  const {
    removeState
  } = useStateDB();

  const {
    removeTask
  } = useTaskDB();

  const [openTaskDialog, setOpenTaskDialog] = useState(false);

  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);

  const [removeItemObj, setRemoveItemObj] = useState({
    removeFromDB : ()=>{},
    dialogTitle : "",
    categoryName : "",
    targetName : ""
  })

  const onClickRemove = ()=>{
    setOpenTaskDialog(false);

    setRemoveItemObj({
      removeFromDB : ()=>{removeState({stateID:state.id})},
      dialogTitle : "Remove State",
      categoryName : "State",
      targetName : state.name
    })
    setOpenRemoveDialog(true);
  };

  const onClickRemoveTask = (task)=>{
    setOpenTaskDialog(false);

    setRemoveItemObj({
      removeFromDB : ()=>{removeTask({taskID:task.id})},
      dialogTitle : "Remove Task",
      categoryName : "Task",
      targetName : task.title
    })
    setOpenRemoveDialog(true);
  };

  const onClickOpenAddOrEditTask = (editTaskForm={})=>{

    setOpenRemoveDialog(false)

    setCurrentEditTaskForm(editTaskForm);
    setOpenTaskDialog(true);
  }

  const closeTaskDialogHandle = ()=>{

    setOpenTaskDialog(false);
  }

  const PaperComponent = memo(({ nodeRef, ...props }) => {
    return (
      <ReactDraggable nodeRef={nodeRef}
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper ref={nodeRef} sx={{ borderRadius: '8px' }} {...props} />
      </ReactDraggable>
    );
  });


  const TaskDialog = memo(() => {

    const dialogNodeRef = useRef(null);

    return (
      <Fragment>
        <Dialog
          open={openTaskDialog}
          onClose={() => closeTaskDialogHandle()}
          PaperComponent={(props) => (
            <PaperComponent {...props} nodeRef={dialogNodeRef} />
          )}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
            {Object.keys(currentEditTaskForm).length <= 0 ? "Create Task" : "Edit Task"}
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

              <TaskFormV2 allUserInProjectDoc={allUserInProjectDoc}
                              setCloseDialogHandle={closeTaskDialogHandle}

                              stateID={state.id}
                              currentTaskForm={currentEditTaskForm}
                              />

            </Paper>
          </DialogContent>
        </Dialog>
      </Fragment >
    );
  });

  const RemoveItemDialog = memo(() => {

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
                    {removeItemObj.dialogTitle}
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
  
                    <RemoveForm removeFromDB={removeItemObj.removeFromDB}
                                categoryName={removeItemObj.categoryName}
                                targetName={removeItemObj.targetName}
                                setOpenDialog={setOpenRemoveDialog}/>
  
                    </Paper>
                </DialogContent>
            </Dialog>
        </Fragment >
    );
  });


  return (
  <div
    style={{
      position:'relative',
      backgroundColor: "#fff",
      borderRadius: "8px",
      padding: "16px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      width: "250px",
      minHeight: '10rem'
    }}
    >
    <TaskDialog />
    <RemoveItemDialog />

    {
      openStateForm ?
      <div style={{width:'100%', color:'inhert'}}>
        <StateForm_V2 projectID={state.projectID} setFormOpen={setOpenStateForm} currentStateForm={state}/>
      </div>
      :
      (
        <h3
          onDoubleClick={() => setOpenStateForm(true)}
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {state.name || "Untitled"}
        </h3>
      )
    }

    {
      !openStateForm &&
      <IconButton style={{ position: 'absolute', right: '10px', top: '10px', zIndex:99,
                          width: 24, height: 24, padding: 2, color:grey[500],
                          backgroundColor: 'transparent', opacity: 0.8
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
              onClickRemove();
          }}
          onMouseDown={(e) => e.preventDefault()}
          >
          <DeleteForeverIcon fontSize="inherit" sx={{
            '&:hover': {
              color: red[400]
            }
          }} />

      </IconButton>
    }

    <Button
      onClick={() => onClickOpenAddOrEditTask()}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: "#0079bf",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        padding: "4px 8px",
        cursor: "pointer",
        marginTop: "8px",
        width: "100%",
        marginBottom: "8px",
        '&:hover':{
          backgroundColor:blue[400]
        }
      }}
    >
      + Add Task
    </Button>

    {/* Droppable Area for Tasks inside the Card */}
    <Droppable droppableId={`state-${stateIndex}`} type="item">
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            position: "relative",
            width: "100%",
            overflowY: "auto", // Enable vertical scrolling
            minHeight: '1rem',
            //maxHeight: "500px", // Adjust based on your layout
          }}
        >
          {state.tasks.length > 0 &&
            state.tasks.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided, snapshot) => (

                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    padding: "8px",
                    marginBottom: "8px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    ...provided.draggableProps.style,
                  }}
                  onClick={()=>onClickOpenAddOrEditTask(task)} // open current Task Form
                >
                  {/* <TaskCardComponent task={task} index={index} provided={provided} snapshot={snapshot}
                                      onClickOpenAddOrEditTask={onClickOpenAddOrEditTask} /> */}

                  <Typography sx={{
                    marginLeft:'1rem',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.3)',
                      color: blue[800]
                    }
                  }}>{task.title}</Typography>
                
                  <RemoveCircleOutlineIcon fontSize="inherit" sx={{
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.3)',
                      color: red[400]
                    }
                  }}
                  onClick={(e)=>{
                    e.stopPropagation();
                    onClickRemoveTask(task);
                  }}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </div>
  );
});

//const NestedDraggableGrid_V2 = ({workingStatesWithTasks, setworkingStatesWithTasks, allUserInProjectDoc}) => {
const NestedDraggableGrid_V2 = ({stateCards, setStateCards, allUserInProjectDoc}) => {

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
    moveState, leaveJoinState
  } = useStateDB();

  const {
    alertComment, setAlertComment
  } = useCommentDB();

  useEffect(()=>{
    setAlertComment({ ...alertComment, message: '', isOpen: false });
  }, [])


  const handleDragEnd = (result) => {
    const { draggableId, source, destination } = result;

    if (!destination) return; // Drop outside the droppable area

    // Log the details
    // console.log("Dragged Item ID:", draggableId);
    // console.log("Source Index:", source.index);
    // console.log("Source Droppable ID:", source.droppableId);
    // console.log("Destination Index:", destination.index);
    // console.log("Destination Droppable ID:", destination.droppableId);

    // if the draggable item no position change, just return
    if (source.droppableId === destination.droppableId && 
        source.index === destination.index) 
    {
      console.log("No Move");
      return;
    }

    // Case 1: Dragging a whole Card (StateCardComponent) to a new position
    //if (source.droppableId.startsWith('card-') && destination.droppableId.startsWith('card-'))

    if (destination.droppableId === 'cards') // consider is moving the whole state card
    {
        const updatedStateCards = Array.from(stateCards);
        const [movedCard] = updatedStateCards.splice(source.index, 1);
        updatedStateCards.splice(destination.index, 0, movedCard);

        setStateCards(updatedStateCards);

        // Here Call Move State To Update Project Collection, the state id order in stateIDs list
        const updateStateDB = async()=>{
          await moveState({stateID:movedCard.id, leaveIndex:source.index, joinIndex:destination.index});
        }
        updateStateDB();
    }

    // Case 2: Dragging an TaskItem within the same Card (StateCardComponent)
    else if (source.droppableId.startsWith('state-') && destination.droppableId === source.droppableId) 
    {
        const stateIndex = parseInt(source.droppableId.replace('state-', ''));
        const state = stateCards[stateIndex];

        const updatedItems = Array.from(state.tasks);
        const [movedItem] = updatedItems.splice(source.index, 1);
        updatedItems.splice(destination.index, 0, movedItem);

        const updatedStateCards = [...stateCards];
        updatedStateCards[stateIndex] = { ...state, tasks: updatedItems };

        setStateCards(updatedStateCards);

        // Here call leaveJoinState to update the State Collection taskIDs order
        const updateStateDB = async()=>{
          await leaveJoinState({leaveStateID:movedItem.stateID, joinStateID:movedItem.stateID,
                               leaveIndex:source.index, joinIndex:destination.index, taskID:draggableId});
        }
        updateStateDB();
    }

    // Case 3: Dragging an TaskItem from one Card to another Card
    else if (source.droppableId.startsWith('state-') && destination.droppableId.startsWith('state-')) 
    {
        const sourceStateIndex = parseInt(source.droppableId.replace('state-', ''));
        const destinationStateIndex = parseInt(destination.droppableId.replace('state-', ''));

        const sourceState = stateCards[sourceStateIndex];
        const destinationState = stateCards[destinationStateIndex];

        const sourceItems = Array.from(sourceState.tasks);
        const [movedItem] = sourceItems.splice(source.index, 1);

        const destinationItems = Array.from(destinationState.tasks);
        destinationItems.splice(destination.index, 0, movedItem);

        const updatedStateCards = [...stateCards];
        updatedStateCards[sourceStateIndex] = { ...sourceState, tasks: sourceItems };
        updatedStateCards[destinationStateIndex] = { ...destinationState, tasks: destinationItems };

        setStateCards(updatedStateCards);

        // Here call leaveJoinState to update the Old State Collection taskIDs and New State Collection taskIDs, and the Task Doc
        const updateStateDB = async()=>{
          await leaveJoinState({leaveStateID:sourceState.id, joinStateID:destinationState.id,
                               leaveIndex:source.index, joinIndex:destination.index, taskID:draggableId});
        }
        updateStateDB();
    }
  };

  return (
    <>
      <Alert alertConfig={alertComment} />
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: "20px" }}>
          <Droppable droppableId="cards" direction="horizontal" isCombineEnabled >
              {(provided) => (
                  <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                          width: 'auto',
                          height: stateCards.length > 0 ? 'auto' : 0,
                          display: 'flex',
                          flexDirection:'row',
                          justifyContent: 'flex-start',
                          gap: '1rem'
                      }}
                  >
                      {stateCards.map((state, stateIndex) => (
                          <Draggable key={`card-${stateIndex}`} draggableId={`card-${stateIndex}`} index={stateIndex}>
                              {(provided, snapshot) => (

                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps} 
                                    // width="100%"
                                    // height="100%"
                                    >

                                    <StateCardComponent
                                          state={state}
                                          stateIndex={stateIndex}
                                          snapshot={snapshot}

                                          allUserInProjectDoc={allUserInProjectDoc}

                                        />
                                  </div>
                              )}
                          </Draggable>
                      ))}
                      {provided.placeholder}
                  </div>
              )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
};

export default memo(NestedDraggableGrid_V2);
