import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove, onSnapshot, writeBatch, WriteBatch } from 'firebase/firestore';
import { userCollectionRef, workSpaceCollectionRef,
    projectCollectionRef, projectStateCollectionRef,
    taskCollectionRef, commentCollectionRef} from '../fireStore/database.js';
import userContext from './userContext.js';
import { arrayUnion } from 'firebase/firestore';
import {getCollectionDocByRefAndID,
        getCollectionDocByRefAndMatchField,
        getCollectionDocsByMultipleRefAndID,
        reclusiveRemoveDoc,
        removeAllTasksFromStateDoc} from '../components/DBUtility.js'
import { useProjectDB } from './projectDBContext.jsx';
import { useUserDB } from './userDBContext.jsx';
import { db } from '../firebaseConfig.js';

const stateContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useStateDB = () => useContext(stateContext);

const StateDBProvider = ({children, workingProjectID})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const { isProjectUpdate } = useProjectDB();

    const [alertState, setAlertState] = useState({});
    const [isStateUpdate, setStateUpdate] = useState(false)

    const [projectData, setProjectData] = useState({});

    const { getUserDocData } = useUserDB();
    const [allUserInProjectDoc, setAllUserInProjectDoc] = useState([]);

    const [stateInfo, setStateInfo] = useState({
        name : "",
        taskIDs : [],
        projectID : workingProjectID
    })

    // workingStatesWithTasks would in the structure as 
    // [{
    //     id:state_1_id, ...doc.data(), tasks : [{id:task_1_id, ...taskDoc.data()}, {id:task_2_id, ...taskDoc.data()}]   
    //  },
    //  {
    //     id:state_2_id, ...doc.data(), tasks : [{id:task_1_id, ...taskDoc.data()}, {id:task_2_id, ...taskDoc.data()}]   
    //  }
    //  ...
    // ]

    const [workingStatesWithTasks, setworkingStatesWithTasks] = useState([]);

    const [isStateLoading, setStateIsLoading] = useState(true)

    const triggerRefreshState = ()=>{
        setStateUpdate(!isStateUpdate)
    }

    const callBackUpdateWorkStateWithTask = async (stateIDs) => {

        if (!stateIDs ||
            stateIDs.length <= 0) 
        {
            console.error("Project StateIDs Not Found");
            setStateIsLoading(false);
            return;
        }

        // const projectData = projectDocSnapshot.data();
        // const stateIDs = projectData.stateIDs || [];

        try 
        {
            // loop each state doc
            const statePromises = stateIDs.map(async(stateID)=>{

                const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);

                if (stateDoc.exists())
                {
                    const projectState = {
                        id: stateRef.id,
                        ...stateData
                    };

                    // The following cannot keep the sequence which recorded in the state doc, 'taskID' field
                    // then query each task linked to the state have doc.id
                    // const taskQuery = query(taskCollectionRef, where('stateID', '==', doc.id));
                    // const taskSnapshot = await getDocs(taskQuery);

                    // const taskList = taskSnapshot.docs.map(taskDoc=>({
                    //     id: taskDoc.id,
                    //     ...taskDoc.data()
                    // }));

                    // Need to get the doc one by one following the list sequence
                    const taskIDs = projectState.taskIDs || [];

                    // Fetch tasks in the order specified by taskIDs
                    const taskPromises = taskIDs.map(async (taskID) => {

                        const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

                        // Check if task exists before getting it
                        if (taskDoc.exists()) {
                            return {
                                id: taskRef.id,
                                ...taskData
                            };
                        } else {
                            console.warn(`Task ${taskID} not found.`);
                            return null; // Handle missing tasks
                        }
                    });

                    // only get the list of task data if exists
                    const taskList = (await Promise.all(taskPromises)).filter(task => task !== null);

                    return {
                        ...projectState,
                        tasks : taskList
                    };
                }
                else
                {
                    console.warn(`State ${stateID} not found.`);
                    return null; // Handle missing states
                }
            });

            const allStatesWithTasks = (await Promise.all(statePromises)).filter(state => state !== null);
            setworkingStatesWithTasks(allStatesWithTasks);
        }
        catch (error) {
            console.error("Error Getting task states", error);
            setAlertProject({
                ...alertState,
                message: 'Error Getting task states',
                color: 'error',
                isOpen: true,
                hideDuration: 2000,
            });
        // Whatever the quit need called loading to false
        } finally {
            setStateIsLoading(false);
        }
    };

    // Load to get the current project states
    useEffect(()=>{

        let unsubscribeProjectDoc = null;

        const getFireBaseProjectStates = async ()=>{

            try
            {
                const {docRef:projectRef, docObj:projectDoc, docData:projectData} = await getCollectionDocByRefAndID(projectCollectionRef, workingProjectID);

                // If project exists
                if (projectDoc.exists())
                {
                    setProjectData(projectData);

                    setAllUserInProjectDoc(await getUserDocData(projectData.memberUIDs))

                    // Unsubscribe every render to avoid memory leaks, then below do the subscribe again
                    if (unsubscribeProjectDoc)
                    {
                        unsubscribeProjectDoc();
                    }

                    // Real-time listener for project collection, more efficiency since not to raise the DB connection for project ID workingProjectID when updated
                    unsubscribeProjectDoc = onSnapshot(
                        doc(projectCollectionRef, workingProjectID), // Listen to the specific project doc
                        (projectDocSnapshot)=>callBackUpdateWorkStateWithTask(projectDocSnapshot.exists() ? projectDocSnapshot.data().stateIDs : []),
                        (error) => {
                            console.error("Real-time Listening Project Doc DB Fail", error);
                            setAlertProject({
                                ...alertState,
                                message: 'Real-time Listening Project Doc DB Fail',
                                color: 'error',
                                isOpen: true,
                                hideDuration: 2000,
                            });
                            setStateIsLoading(false);
                        }
                    );
                }
                else
                {
                    setStateIsLoading(false);
                    console.log("Firebase Project Not Exist", error);
                    setAlertState({...alertState, message:'Firebase Project Not Exist', color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
            catch(error)
            {
                setStateIsLoading(false);
                console.log("Firebase Get Project State Fail", error);
                setAlertState({...alertState, message:'Firebase Get Current WorkSpace Project Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }

        if (_currentUser &&
            _currentUser.uid &&
            workingProjectID)
        {
            getFireBaseProjectStates()
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeProjectDoc)
            {
                unsubscribeProjectDoc();
            }
        };

    }, [isProjectUpdate, _currentUser?.loggedIn, _currentUser?.isUpdating, isStateUpdate, workingProjectID])

    useEffect(()=>{

        let unsubscribeStatesList = [];

        if (projectData?.stateIDs)
        {
            if (unsubscribeStatesList.length > 0)
            {
                // release every time before refresh a new subscribe
                unsubscribeStatesList.forEach((unsubscribe) => unsubscribe());
                unsubscribeStatesList.length = 0; // reset
            }

            projectData.stateIDs.forEach((stateID) => {
                const docRef = doc(projectStateCollectionRef, stateID);

                const unsubscribe = onSnapshot(docRef,
                    (stateDocSnapshot)=>callBackUpdateWorkStateWithTask(projectData.stateIDs),
                    (error) => {
                        console.error("Real-time Listening Project Doc DB Fail", error);
                        setAlertProject({
                            ...alertState,
                            message: 'Real-time Listening Project Doc DB Fail',
                            color: 'error',
                            isOpen: true,
                            hideDuration: 2000,
                        });
                        setStateIsLoading(false);
                    });
        
                unsubscribeStatesList.push(unsubscribe);
            });
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeStatesList.length > 0)
            {
                unsubscribeStatesList.forEach((unsubscribe) => unsubscribe());
                unsubscribeStatesList.length = 0; // reset
            }
        };

    }, [projectData])

    useEffect(()=>{
        setAlertState({...alertState, message:'', isOpen: false });
    }, []);

    const createState = async ({formData})=>{

        if (workingProjectID)
        {
            try
            {
                const {docRef:projectRef, docObj:projectDoc, docData:projectData} = await getCollectionDocByRefAndID(projectCollectionRef, workingProjectID);
    
                if (projectDoc.exists())
                {
                    //setStateIsLoading(true);

                    const batch = writeBatch(db);

                    const newStateRef = doc(projectStateCollectionRef);
                    batch.set(newStateRef, {
                        ...formData,
                        taskIDs: [],
                        projectID: workingProjectID
                    });
    
                    // const stateRef = await addDoc(projectStateCollectionRef, {
                    //     ...formData,
                    //     taskIDs : [],
                    //     projectID : workingProjectID
                    // });
    
                    // Update Project Collection
                    batch.update(projectRef, {
                        stateIDs : arrayUnion(newStateRef.id)
                    });

                    await batch.commit();
    
                    triggerRefreshState();
                    setAlertState({...alertState, message:`Success Added New State ${formData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
                }
                else
                {
                    console.log("Firebase Project Not Exist", error);
                    setAlertState({...alertState, message:`Project Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
            catch(error)
            {
                console.log("Add Firebase Project State Fail", error);
                setAlertState({...alertState, message:'Add New Project State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }

        }
    }

    const joinState = async({stateID, taskID})=>{

        try
        {
            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

            if (stateDoc.exists() &&
                taskDoc.exists())
            {
                //setStateIsLoading(true);

                const batch = writeBatch(db);

                // Update State Collection
                batch.update(stateRef, {
                    taskIDs : arrayUnion(taskID)
                });

                // Update Task Collection
                batch.update(taskRef, {
                    stateID : stateID
                });

                await batch.commit();

                triggerRefreshState();
                setAlertState({...alertState, message:`${taskData.title} Moved To State ${stateData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = taskDoc.exists() ? 'State' : 'Task';
                setAlertState({...alertState, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Move To State Fail", error);
            setAlertState({...alertState, message:'Move To State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const leaveState = async({stateID, taskID})=>{

        try
        {
            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

            if (stateDoc.exists() &&
                taskDoc.exists())
            {
                //setStateIsLoading(true);

                const batch = writeBatch(db);

                 // Update State Collection
                 batch.update(stateRef, {
                    taskIDs : arrayRemove(taskID)
                });

                // Update Task Collection
                batch.update(taskRef, {
                    stateID : ""
                });

                // Commit the batch
                await batch.commit();

                triggerRefreshState();
                setAlertState({...alertState, message:`${taskData.title} Success Left State ${stateData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = taskDoc.exists() ? 'State' : 'Task';
                setAlertState({...alertState, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Leave State Fail", error);
            setAlertState({...alertState, message:'Leave State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const moveState = async({stateID, leaveIndex, joinIndex})=>{

        try
        {
            const {docRef:projectRef, docObj:projectDoc, docData:projectData} = await getCollectionDocByRefAndID(projectCollectionRef, workingProjectID);

            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);

            if (stateDoc.exists() &&
                projectDoc.exists())
            {
                //setStateIsLoading(true);

                // Update project Collection with desire order position of stateIDs
                const currentStateIDsList = projectData.stateIDs || [];
                const updatedStateIDs =[...currentStateIDsList];

                const [moveStateID] = updatedStateIDs.splice(leaveIndex, 1);
                updatedStateIDs.splice(joinIndex, 0, moveStateID);

                await updateDoc(projectRef, {
                    stateIDs : updatedStateIDs
                });

                triggerRefreshState();
                setAlertState({...alertState, message:`State ${stateData.name} Moved`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = stateDoc.exists() ? 'Project' : 'Task';
                setAlertState({...alertState, message:`${errMessage} Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            } 
        }
        catch(error)
        {
            console.log("Move State Fail", error);
            setAlertState({...alertState, message:'Move State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const leaveJoinState = async({leaveStateID, joinStateID, leaveIndex, joinIndex, taskID})=>{

        try
        {
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

            if (leaveStateID == joinStateID)
            {
                const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, joinStateID);

                if (stateDoc.exists() &&
                    taskDoc.exists())
                {
                    //setStateIsLoading(true);

                    // Since only allocate the order of TaskID within the same State, no need to remove and update the task doc
    
                    // Update State Collection with desire task order position
                    const currentTaskIDsList = stateData.taskIDs || [];
                    const updatedTaskIDs =[...currentTaskIDsList];

                    const [moveTaskID] = updatedTaskIDs.splice(leaveIndex, 1);
                    updatedTaskIDs.splice(joinIndex, 0, moveTaskID);
    
                    await updateDoc(stateRef, {
                        taskIDs : updatedTaskIDs
                    });
    
                    triggerRefreshState();
                    setAlertState({...alertState, message:`${taskData.title} Moved Within State ${stateData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
                }
                else
                {
                    const errMessage = taskDoc.exists() ? 'State' : 'Task';
                    setAlertState({...alertState, message:`${errMessage} Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
                }

            }
            else
            {
                const docsObjArray = await getCollectionDocsByMultipleRefAndID(projectStateCollectionRef, [leaveStateID, joinStateID]);
                const {docRef:leaveStateRef, docObj:leaveStateDoc, docData:leaveStateData} = docsObjArray[0];
                const {docRef:joinStateRef, docObj:joinStateDoc, docData:joinStateData} = docsObjArray[1];
    
                if (leaveStateDoc.exists() &&
                    joinStateDoc.exists() &&
                    taskDoc.exists())
                {
                    //setStateIsLoading(true);

                    const batch = writeBatch(db);
    
                    // Update Leave State Collection
                    batch.update(leaveStateRef, {
                        taskIDs : arrayRemove(taskID)
                    });
    
                    // Update Join State Collection with desire order position
                    const currentTaskIDsList = joinStateData.taskIDs || [];
                    const updatedTaskIDs = [
                        ...currentTaskIDsList.slice(0, joinIndex),
                        taskID,
                        ...currentTaskIDsList.slice(joinIndex)
                    ];
    
                    batch.update(joinStateRef, {
                        taskIDs : updatedTaskIDs
                    });
    
                    // Update Task Collection
                    batch.update(taskRef, {
                        stateID : joinStateID
                    });

                    // Commit the batch as one firebase operation trigger
                    await batch.commit();
    
                    triggerRefreshState();
                    setAlertState({...alertState, message:`${taskData.title} Leave ${leaveStateData.name} Moved To State ${joinStateData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
                }
                else
                {
                    const errMessage = taskDoc.exists() ? (leaveStateDoc.exists() ? 'Join State' : 'Leave State') : 'Task';
                    setAlertState({...alertState, message:`${errMessage} Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
        }
        catch(error)
        {
            console.log("Move To State Fail", error);
            setAlertState({...alertState, message:'Move To State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editState = async ({formData, stateID}) => {

        try {
            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);

            if (stateDoc.exists()) 
            {
                //setStateIsLoading(true);

                await setDoc(stateRef, formData, {merge: true});

                triggerRefreshState();
                setAlertState({ ...alertState, message: `Success Modify State ${stateData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else {
                console.log("Firebase State Not Exist", error);
                setAlertState({ ...alertState, message: `State Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch (error) {
            console.log("Modify Firebase State Fail", error);
            setAlertState({ ...alertState, message: 'Modify State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const removeState = async({stateID})=>{

        try
        {
            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);
            //const {docRefList:userDocRefList, docObjList:userDocObjList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            // Here should get all the linked database id, and remove the inner child first
            // Remove all the Task doc
            // Remove all the related Work State doc
            // Remove the workspace project list
            // Remove the Project doc

            // If State doc exist
            if (stateDoc.exists()) // &&
                //userDocRefList.length > 0)
            {
                //setStateIsLoading(true);

               // ------------------- The 1st step, remove comments, tasks sequentially -------------- //
                await removeAllTasksFromStateDoc(stateData);

                // ------------------- The 2nd step -------------- //
                const stateName = stateData.name;

                // Update Project Collection
                const {docRef:projectRef} = await getCollectionDocByRefAndID(projectCollectionRef, stateData.projectID);

                const batch2ndStep = writeBatch(db);

                batch2ndStep.delete(stateRef);

                batch2ndStep.update(projectRef, {
                    stateIDs : arrayRemove(stateID)
                })

                await batch2ndStep.commit();

                // await deleteDoc(stateRef);

                // await updateDoc(projectRef, {
                //     stateIDs : arrayRemove(stateID)
                // })

                triggerRefreshState();
                setAlertState({...alertState, message:`Success Remove State ${stateName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                //const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Project Not Exist';
                const errMessage = 'State Not Exist';
                setAlertState({...alertState, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Remove Firebase State Fail", error);
            setAlertState({...alertState, message:'Remove State Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return (
        <stateContext.Provider value={{
            workingStatesWithTasks, setworkingStatesWithTasks,
            projectData, allUserInProjectDoc,
            alertState, setAlertState,
            isStateLoading, setStateIsLoading,
            createState, joinState, removeState, leaveState, editState, leaveJoinState, moveState
        }}>
            {children}
        </stateContext.Provider>
    )
}

export {useStateDB, StateDBProvider}