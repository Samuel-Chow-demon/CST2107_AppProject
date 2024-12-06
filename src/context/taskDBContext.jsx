import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove, onSnapshot } from 'firebase/firestore';
import { userCollectionRef, workSpaceCollectionRef,
    projectCollectionRef, projectStateCollectionRef,
    taskCollectionRef, commentCollectionRef} from '../fireStore/database.js';
import userContext from './userContext.js';
import { arrayUnion } from 'firebase/firestore';
import {getCollectionDocByRefAndID,
        getCollectionDocByRefAndMatchField,
        reclusiveRemoveDoc} from '../components/DBUtility.js'

const taskContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useTaskDB = () => useContext(taskContext);

const TaskDBProvider = ({children})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const [alertTask, setAlertTask] = useState({});

    const [projectData, setProjectData] = useState({});

    useEffect(()=>{
        setAlertTask({...alertTask, message:'', isOpen: false });
    }, []);

    const createTask = async ({formData})=>{

        if (workingProjectID)
        {
            try
            {
                const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, formData.stateID);
    
                if (stateDoc.exists())
                {
                    //setTaskIsLoading(true);
    
                    const taskRef = await addDoc(taskCollectionRef, {
                        ...formData,
                        commentIDs : [],
                        imgs : []
                    });
    
                    // Update State Collection
                    await updateDoc(stateRef, {
                        stateIDs : arrayUnion(taskRef.id)
                    });
    
                    //triggerRefreshTask();
                    setAlertTask({...alertTask, message:`Success Added New Task ${formData.title}`, color: 'success', isOpen: true, hideDuration: 1500 });
                }
                else
                {
                    console.log("Firebase Project Not Exist", error);
                    setAlertTask({...alertTask, message:`State Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
            catch(error)
            {
                console.log("Add Firebase State Task Fail", error);
                setAlertTask({...alertTask, message:'Add New State Task Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }

        }
    }

    const editTask = async ({formData, taskID}) => {

        try {
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

            if (taskDoc.exists()) 
            {
                //setTaskIsLoading(true);

                await setDoc(taskRef, formData, {merge: true});

                //triggerRefreshTask();
                setAlertTask({ ...alertTask, message: `Success Modify Task ${taskData.title}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else {
                console.log("Firebase Task Not Exist", error);
                setAlertTask({ ...alertTask, message: `Task Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch (error) {
            console.log("Modify Firebase Task Fail", error);
            setAlertTask({ ...alertTask, message: 'Modify Task Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const removeTask = async({taskID})=>{

        try
        {
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);
            //const {docRefList:userDocRefList, docObjList:userDocObjList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            // Here should get all the linked database id, and remove the inner child first
            // Remove all the Task doc
            // Remove all the related Work State doc
            // Remove the workspace project list
            // Remove the Project doc

            // If Task doc exist
            if (taskDoc.exists()) // &&
                //userDocRefList.length > 0)
            {
                //setTaskIsLoading(true);
                
                const allCommentIDs = taskData.commentIDs;

                allCommentIDs.forEach(async(commentID)=>{
                    
                    await reclusiveRemoveDoc(commentCollectionRef, "replyID", commentID);

                })

                const taskName = taskData.title;
                const taskRelatedStateID = taskData.stateID;
                await deleteDoc(taskRef);

                // Update State Collection
                const {docRef:stateRef} = await getCollectionDocByRefAndID(projectStateCollectionRef, taskRelatedStateID);

                await updateDoc(stateRef, {
                    taskIDs : arrayRemove(taskID)
                })

                //triggerRefreshTask();
                setAlertTask({...alertTask, message:`Success Remove Task ${taskName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                //const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Project Not Exist';
                const errMessage = 'Task Not Exist';
                setAlertTask({...alertTask, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Remove Firebase Task Fail", error);
            setAlertTask({...alertTask, message:'Remove Task Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return (
        <taskContext.Provider value={{
            alertTask, setAlertTask,
            createTask, removeTask, editTask
        }}>
            {children}
        </taskContext.Provider>
    )
}

export {useTaskDB, TaskDBProvider}