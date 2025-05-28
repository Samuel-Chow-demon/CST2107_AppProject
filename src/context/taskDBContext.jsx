import { arrayRemove, arrayUnion, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    getCollectionDocByRefAndID,
    getCollectionDocsByMultipleRefAndID,
    getExpireDate,
    guestExpireConfig,
    reclusiveRemoveDoc
} from '../components/DBUtility.js';
import { db } from '../firebaseConfig.js';
import {
    commentCollectionRef,
    projectStateCollectionRef,
    taskCollectionRef
} from '../fireStore/database.js';
import userContext from './userContext.js';

const taskContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useTaskDB = () => useContext(taskContext);

const TaskDBProvider = ({children})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const [alertTask, setAlertTask] = useState({});

    const [currentTaskData, setCurrentTaskData] = useState({});

    const [currentAllCommentsInTask, setCurrentAllCommentsInTask] = useState([]);

    useEffect(()=>{
        setAlertTask({...alertTask, message:'', isOpen: false });
    }, []);

    const reclusiveRetriveCommentData = async(thisLayerDocObj, thisLayerDocData)=>{

        if (!thisLayerDocObj.exists())
        {
            return {};
        }

        const replyIDs = thisLayerDocData.replyIDs || [];

        if (replyIDs.length > 0)
        {
            const listOfRefObj = await getCollectionDocsByMultipleRefAndID(commentCollectionRef, thisLayerDocData.replyIDs);

            const listOfDocDataObj = await Promise.all(

                listOfRefObj.map(async({ docRef, docObj, docData })=>{

                    return {
                        id:docData.id,
                        ...docData,
                        replies: await reclusiveRetriveCommentData(docObj, docData)
                    };
                })
            );

            //console.log(listOfDocDataObj);

            // const obj = {
            //     id:thisLayerDocData.id,
            //     ...thisLayerDocData,
            //     replies: listOfDocDataObj
            // }

            return listOfDocDataObj; 
        }
        else
        {
            return [];
        }
    }

    const getAllCommentByCommentIDs = async(commentIDs)=>{

        if (commentIDs?.length > 0)
        {
            // list of [{ docRef, docObj, docData }]
            const listOfDocRefObj = await getCollectionDocsByMultipleRefAndID(commentCollectionRef, commentIDs);

            const promises = listOfDocRefObj.map(async({ docRef, docObj, docData })=>{

                if (docObj.exists())
                {
                    return {
                        id:docData.id,
                        ...docData,
                        replies: await reclusiveRetriveCommentData(docObj, docData)
                    };
                }
            })

            const listOfAllCommentsInTask = await Promise.all(promises);

            setCurrentAllCommentsInTask(listOfAllCommentsInTask);
        }
        else
        {
            setCurrentAllCommentsInTask([]);
        }
    }

    const callbackRefreshAllCommentsInTask = async(snapshot)=>{
        if (snapshot.exists())
        {
            const taskDocData = snapshot.data();

            // [{
            //     id:comment_id, ...docData, replies : [ {id:comment_id, ...docData, replies : []}, {id:comment_id_2, docData, replies : []} .... ]
            // }
            // ....
            // {
            //     id:comment_id, ...docData, replies : [ {id:comment_id, ...docData, replies : []}, {id:comment_id_2, docData, replies : []} .... ]
            // }]

            await getAllCommentByCommentIDs(taskDocData.commentIDs);

            // if (taskDocData.commentIDs?.length > 0)
            // {
            //     // list of [{ docRef, docObj, docData }]
            //     const listOfDocRefObj = await getCollectionDocsByMultipleRefAndID(commentCollectionRef, taskDocData.commentIDs);

            //     const promises = listOfDocRefObj.map(async({ docRef, docObj, docData })=>{

            //         return {
            //             id:docData.id,
            //             ...docData,
            //             replies: await reclusiveRetriveCommentData(docObj, docData)
            //         };
            //     })

            //     const listOfAllCommentsInTask = await Promise.all(promises);

            //     setCurrentAllCommentsInTask(listOfAllCommentsInTask);
            // }
            // else
            // {
            //     setCurrentAllCommentsInTask([]);
            // } 
        }
    }

    useEffect(()=>{

        let unsubscribeTaskDoc = null;

        if (Object.keys(currentTaskData).length > 0)
        {
            if (unsubscribeTaskDoc)
            {
                unsubscribeTaskDoc();
            }

            unsubscribeTaskDoc = onSnapshot(
                doc(taskCollectionRef, currentTaskData.id), // Listen to the specific project doc
                (snapshot)=>callbackRefreshAllCommentsInTask(snapshot),
                (error) => {
                    console.error("Real-time Listening Task Doc DB Fail", error);
                    setAlertTask({
                        ...alertTask,
                        message: 'Real-time Listening Task Doc DB Fail',
                        color: 'error',
                        isOpen: true,
                        hideDuration: 2000,
                    });
                }
            );
        }
        
        // clear up
        return ()=>{
            if (unsubscribeTaskDoc)
            {
                unsubscribeTaskDoc();
            }
        }

    }, [currentTaskData]) // when current Task Data switch, means open other task page, do refresh the listening trigger

    const createTask = async ({formData})=>{

        try
        {
            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, formData.stateID);

            if (stateDoc.exists())
            {
                //setTaskIsLoading(true);

                const newTaskRef = doc(taskCollectionRef);

                let newTaskObj = {
                    id:newTaskRef.id,
                    ...formData,
                    commentIDs : [],
                    imgs : []
                }

                if (_currentUser?.isGuest)
                {
                    const getDate = getExpireDate(guestExpireConfig);

                    newTaskObj = {
                        ...newTaskObj,
                        expiredAt : getDate.expire
                    }
                }

                const batch = writeBatch(db);

                batch.set(newTaskRef, newTaskObj);

                batch.update(stateRef, {
                    taskIDs : arrayUnion(newTaskRef.id)
                })

                await batch.commit();

                // const taskRef = await addDoc(taskCollectionRef, {
                //     ...formData,
                //     commentIDs : [],
                //     imgs : []
                // });

                // Update State Collection
                // await updateDoc(stateRef, {
                //     taskIDs : arrayUnion(taskRef.id)
                // });

                //triggerRefreshTask();
                setAlertTask({...alertTask, message:`Success Added New Task ${formData.title}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                console.log("Firebase State Not Exist", error);
                setAlertTask({...alertTask, message:`State Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Add Firebase State Task Fail", error);
            setAlertTask({...alertTask, message:'Add New State Task Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editTask = async ({formData, taskID}) => {

        try {
            const {docRef:stateRef, docObj:stateDoc, docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, formData.stateID);
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

            if (taskDoc.exists() &&
                stateDoc.exists())
            {
                //setTaskIsLoading(true);

                const batch = writeBatch(db);

                batch.set(taskRef, formData, {merge: true});

                // Update State Collection, perform a trigger update in the purpose of firing the StateBoard snapshot listening trigger to update the
                // StatesWithTaskObject
                batch.update(stateRef, {
                    trigger : stateData.trigger? !stateData.trigger : true
                });

                await batch.commit();

                //triggerRefreshTask();
                setAlertTask({ ...alertTask, message: `Success Modify Task ${taskData.title}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else 
            {
                const errItem = stateDoc.exists() ? "Task" : "State"
                console.log(`Firebase ${errItem} Not Exist`, error);
                setAlertTask({ ...alertTask, message: `${errItem} Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
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
                    
                    await reclusiveRemoveDoc(commentCollectionRef, "replyIDs", commentID);

                })

                const taskName = taskData.title;

                // Get Related State Collection
                const {docRef:stateRef} = await getCollectionDocByRefAndID(projectStateCollectionRef, taskData.stateID);

                const batch = writeBatch(db);

                batch.delete(taskRef);

                batch.update(stateRef, {
                    taskIDs : arrayRemove(taskID)
                })

                await batch.commit();

                // await deleteDoc(taskRef);

                // await updateDoc(stateRef, {
                //     taskIDs : arrayRemove(taskID)
                // })

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

    const removeTaskByRefAndDocData = async({taskRef, taskDocData})=>{

        let message = "";
        try
        {
            const allCommentIDs = taskDocData.commentIDs;

            const promises = allCommentIDs.map(async(commentID)=>{
                
                await reclusiveRemoveDoc(commentCollectionRef, "replyIDs", commentID);
            })

            await Promise.all(promises);

            // Get Related State Collection
            const {docRef:stateRef} = await getCollectionDocByRefAndID(projectStateCollectionRef, taskDocData.stateID);

            const batch = writeBatch(db);

            batch.delete(taskRef);

            batch.update(stateRef, {
                taskIDs : arrayRemove(taskDocData.id)
            })

            await batch.commit();

            message = "OK";
           
        }
        catch(error)
        {
            message = `Remove Task Fail : ${error}`
        }

        return {
            message : message,
            data : taskDocData
        }
    }

    return (
        <taskContext.Provider value={{
            alertTask, setAlertTask,
            currentAllCommentsInTask, setCurrentTaskData, getAllCommentByCommentIDs,
            createTask, removeTask, editTask,
            removeTaskByRefAndDocData
        }}>
            {children}
        </taskContext.Provider>
    )
}

export { TaskDBProvider, useTaskDB };
