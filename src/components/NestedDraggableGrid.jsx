import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Button, Card, CardContent, IconButton, Paper } from '@mui/material';
import { blueGrey, grey, red } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Fragment, memo, useEffect, useRef, useState } from 'react';
import ReactDraggable from 'react-draggable';
import { useStateDB } from '../context/stateDBContext';
import RemoveForm from './RemoveForm';
import StateForm from './StateForm';
import TaskFormV2 from './TaskFormV2';

const TaskCardComponent = ({ task, index, provided, snapshot }) => (
  <Box
    ref={provided.innerRef}
    {...provided.draggableProps}
    {...provided.dragHandleProps}
    sx={{
      padding: 1,
      marginBottom: 1,
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '4px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
      boxShadow: snapshot.isDragging
        ? '0 4px 8px rgba(0, 0, 0, 0.2)'
        : 'none',
    }}
  >
    {task.title}
  </Box>
);

const StateActionComponent = ({ onClickEdit, onClickRemove, onClose }) => {
  const componentRef = useRef(null);

  const handleClickOutside = (event) => {
    if (componentRef.current && !componentRef.current.contains(event.target)) 
      {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Box ref={componentRef} 
        sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center', 
            padding: "5px",
            gap: '10px',
            background: blueGrey[700],
            borderRadius: '4px',
            width : 'auto',
            height : 'auto'
          }}>

      <Button sx={{
              width: '100%',
              backgroundColor: blueGrey[100],
              '&:hover':{
                  color:grey[300],
                  backgroundColor:grey[600]
              }
          }}
          onClick={onClickEdit}>
          Edit
      </Button>
      <Button sx={{
              width: '100%',
              backgroundColor: blueGrey[100],
              '&:hover':{
                  color:grey[100],
                  backgroundColor:red[300]
              }
          }} 
          onClick={onClickRemove}>
          Remove
      </Button>
      
    </Box>
  );
}

const StateCardComponent = ({ state, stateIndex, snapshot, setRemoveStateObj, setOpenRemoveDialog,
                              setOpenTaskDialog, setCurrentTaskStateID, setEditTaskForm}) => {

  const [openActionBox, setOpenActionBox] = useState(false);
  const [openStateForm, setOpenStateForm] = useState(false);

  const onClickEdit = ()=>{
    setOpenActionBox(false);
    setOpenRemoveDialog(false);
    setOpenTaskDialog(false);

    setOpenStateForm(true);

  };
  const onClickRemove = ()=>{
    setOpenActionBox(false);
    setOpenTaskDialog(false);

    setRemoveStateObj(state);
    setOpenRemoveDialog(true);
  };

  const onClickOpenAddOrEditTask = (editTaskForm={})=>{
    setOpenActionBox(false);
    setOpenRemoveDialog(false)
    setCurrentTaskStateID(state.id);
    setEditTaskForm(editTaskForm); // if empty object means at the Add New Task Button

    setOpenTaskDialog(true);
  }


  return (
  <Card
    sx={{
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        userSelect:'none',
        gap: '5px',
        backgroundColor: grey[700],
        color:'white',
        minHeight: '150px',
        height: 'auto',
        width: '15rem',
        borderRadius: '8px',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        fontSize: '1.2rem',
        boxShadow: snapshot.isDragging ? '0 4px 8px rgba(0, 0, 0, 0.2)' : 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
    }}
    >

    {
      openStateForm &&
      <Box sx={{ width : '90%', zIndex: 99, display:'flex', justifyContent:'center'}}>
        <StateForm projectID={state.projectID} setFormOpen={setOpenStateForm} currentStateForm={state}/>
      </Box>
    }
    {
      openActionBox &&
      <Box sx={{ width : '90%', zIndex: 98}}>
        <StateActionComponent onClickEdit={onClickEdit} onClickRemove={onClickRemove} onClose={()=>setOpenActionBox(false)} />
      </Box>
    }

    {state.name}

    <IconButton style={{ position: 'absolute', right: '5px', top: '5px',
                        width: 40, height: 40, padding: 2,
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
            setOpenActionBox(!openActionBox);
        }}
        onMouseDown={(e) => e.preventDefault()}
        >
        <MoreVertIcon fontSize="inherit" />

    </IconButton>

    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 2,
      fontSize: '1.1rem',
      color: grey[700],
      width: '12rem',
      height: '2rem',
      cursor: 'pointer',
      transition: 'transform 0.3s, box-shadow 0.3s',
      '&:hover': {
        boxshadow: 6,
        transform: 'scale(1.05)',
        borderColor: grey[300],
        backgroundColor: "#dee3bf",
        color: grey[700],
        '& .icon': {
          color: grey[700]
        }
      },
      border: '2px solid',
      borderColor: grey[500],
      borderRadius: '8px',
      backgroundColor: "#c2c7a5"
    }}
      onClick={() => onClickOpenAddOrEditTask()}
    >
      <AddIcon className="icon" sx={{
        fontSize: 15,
        color: grey[700]
      }}
      />
      Add Task
    </Box>

    <CardContent>

      {/* Droppable Area for Tasks inside the Card */}
      <Droppable droppableId={`state-${stateIndex}`} type="item">
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ minHeight: '100px' }}
          >
            { state.tasks.length > 0 &&
              state.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <TaskCardComponent task={task} index={index} provided={provided} snapshot={snapshot} />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </CardContent>
  </Card>
  );
}

const NestedDraggableGrid = ({workingStatesWithTasks, allUserInProjectDoc}) => {

    // workingStatesWithTasks would in the structure as 
    // [{
    //     id:state_1_id, ...doc.data(), tasks : [{id:task_1_id, ...taskDoc.data()}, {id:task_2_id, ...taskDoc.data()}]   
    //  },
    //  {
    //     id:state_2_id, ...doc.data(), tasks : [{id:task_1_id, ...taskDoc.data()}, {id:task_2_id, ...taskDoc.data()}]   
    //  }
    //  ...
    // ]

  const [stateCards, setStateCards] = useState(workingStatesWithTasks);

  const [openRemoveDialog, setOpenRemoveDialog] = useState(false);
  const [removeStateObj, setRemoveStateObj] = useState({});

  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [currentTaskStateID, setCurrentTaskStateID] = useState("");
  const [editTaskForm, setEditTaskForm] = useState({});

  const {
    moveState
  } = useStateDB();

  useEffect(()=>{
    setStateCards(workingStatesWithTasks)
  }, [workingStatesWithTasks]);

  const handleDragEnd = (result) => {
    const { draggableId, source, destination } = result;

    if (!destination) return; // Drop outside the droppable area

    // Log the details
    console.log("Dragged Item ID:", draggableId);
    console.log("Source Index:", source.index);
    console.log("Source Droppable ID:", source.droppableId);
    console.log("Destination Index:", destination.index);
    console.log("Destination Droppable ID:", destination.droppableId);

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
        updatedStateCards[stateIndex] = { ...state, items: updatedItems };

        setStateCards(updatedStateCards);

        // Here call leaveJoinState to update the State Collection taskIDs order
        // await leaveJoinState()
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
        updatedStateCards[sourceStateIndex] = { ...sourceState, items: sourceItems };
        updatedStateCards[destinationStateIndex] = { ...destinationState, items: destinationItems };

        setStateCards(updatedStateCards);

        // Here call leaveJoinState to update the Old State Collection taskIDs and New State Collection taskIDs, and the Task Doc
        // await leaveJoinState()
    }
  };

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

  const RemoveStateDialog = memo(() => {

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
                    Remove State
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
  
                    <RemoveForm removeFromDB={()=>{removeState({stateID:removeStateObj.id})}}
                                categoryName={'State'}
                                targetName={removeStateObj.name}
                                setOpenDialog={setOpenRemoveDialog}/>
  
                    </Paper>
                </DialogContent>
            </Dialog>
        </Fragment >
    );
  });

  const TaskDialog = memo(() => {

    const dialogNodeRef = useRef(null);

    return (
      <Fragment>
        <Dialog
          open={openTaskDialog}
          onClose={() => setOpenTaskDialog(false)}
          PaperComponent={(props) => (
            <PaperComponent {...props} nodeRef={dialogNodeRef} />
          )}
          aria-labelledby="draggable-dialog-title"
        >
          <DialogTitle style={{ cursor: 'move', textAlign: 'center' }} id="draggable-dialog-title">
            Create Task
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
                              setOpenDialog={setOpenTaskDialog}
                              stateID={currentTaskStateID}
                              currentTaskForm={editTaskForm}/>

            </Paper>
          </DialogContent>
        </Dialog>
      </Fragment >
    );
  });

  return (
    <>
      <RemoveStateDialog />
      <TaskDialog />
      <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="cards" direction="horizontal" isCombineEnabled >
              {(provided) => (
                  <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                          display: stateCards.length > 0 ? 'grid' : 'none', // Hide if no items
                          gridAutoFlow: 'row', // Items flow horizontally
                          gridTemplateColumns: 'repeat(auto-fill, minmax(0, 15rem))', // Each item has max width of 200px
                          gridTemplateRows: '1fr', // Items take full height of the parent
                          width: 'auto',
                          height: stateCards.length > 0 ? 'auto' : 0, // Shrink height if no items
                          gap: 2, // Optional spacing
                          overflowX: 'auto', // Enable horizontal scrolling
                          overflowY: 'hidden', // Prevent vertical overflow
                          p: stateCards.length > 0 ? 3 : 0, // Remove padding when empty
                      }}
                  >
                      {stateCards.map((state, stateIndex) => (
                          <Draggable key={`card-${stateIndex}`} draggableId={`card-${stateIndex}`} index={stateIndex}>
                              {(provided, snapshot) => (

                                  <div 
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps} width="100%" height="100%">

                                    <StateCardComponent
                                          state={state}
                                          stateIndex={stateIndex}
                                          snapshot={snapshot}
                                          setRemoveStateObj={setRemoveStateObj}
                                          setOpenRemoveDialog={setOpenRemoveDialog}
                                          setOpenTaskDialog={setOpenTaskDialog}
                                          setCurrentTaskStateID={setCurrentTaskStateID}
                                          setEditTaskForm={setEditTaskForm}
                                        />
                                  </div>
                              )}
                          </Draggable>
                      ))}
                      {provided.placeholder}
              </Box>
              )}
          </Droppable>
      </DragDropContext>
    </>
  );
};

export default memo(NestedDraggableGrid);
