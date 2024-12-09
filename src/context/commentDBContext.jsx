import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove, onSnapshot, writeBatch } from 'firebase/firestore';
import { userCollectionRef, workSpaceCollectionRef,
    projectCollectionRef, projectStateCollectionRef,
    taskCollectionRef, commentCollectionRef} from '../fireStore/database.js';
import userContext from './userContext.js';
import { arrayUnion } from 'firebase/firestore';
import {getCollectionDocByRefAndID,
        getCollectionDocByRefAndMatchField,
        reclusiveRemoveDoc} from '../components/DBUtility.js'
import { db } from '../firebaseConfig.js';

const commentContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useCommentDB = () => useContext(commentContext);

const CommentDBProvider = ({children})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const [alertComment, setAlertComment] = useState({});

    const [commentData, setCommentData] = useState({});

    useEffect(()=>{
        setAlertComment({...alertComment, message:'', isOpen: false });
    }, []);

    const createComment = async ({formData, parentCommentID = ""})=>{

        try
        {
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, formData.taskID);

            if (taskDoc.exists())
            {
                //setCommentIsLoading(true);

                const batch = writeBatch(db);

                const newCommentRef = doc(commentCollectionRef);
                batch.set(newCommentRef, {
                    id:newCommentRef.id,
                    ...formData             // should included the taskID:id
                });
                
                if (parentCommentID != "")
                {
                    const {docRef:parentCommentRef, docObj:parentCommentDoc, docData:parentCommentData} = await getCollectionDocByRefAndID(commentCollectionRef, parentCommentID);
                    if (parentCommentDoc.exists())
                    {
                        batch.update(parentCommentRef, {
                            replyIDs : arrayUnion(newCommentRef.id)
                        })
        
                    }
                }
                // Only the 1st layer to the task need to add to Task Doc
                else
                {
                    batch.update(taskRef, {
                        commentIDs : arrayUnion(newCommentRef.id)
                    })
                }

                // Trigger to hit the snap listening
                batch.update(taskRef, {
                    trigger : taskData.trigger? !taskData.trigger : true
                });

                await batch.commit();

                //triggerRefreshComment();
                setAlertComment({...alertComment, message:`Success Added New Comment`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                console.log("Firebase Task Not Exist", error);
                setAlertComment({...alertComment, message:`Task Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Add Firebase Task Comment Fail", error);
            setAlertComment({...alertComment, message:'Add New Task Comment Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editComment = async ({formData, commentID}) => {

        try {
            const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, formData.taskID);
            const {docRef:commentRef, docObj:commentDoc, docData:commentData} = await getCollectionDocByRefAndID(commentCollectionRef, commentID);

            if (taskDoc.exists() &&
                commentDoc.exists())
            {
                //setCommentIsLoading(true);

                const batch = writeBatch(db);

                batch.set(commentRef, formData, {merge: true});

                // Update Task Collection, perform a trigger update in the purpose of firing the TaskPage snapshot listening trigger 
                // to update only the taskPage comment object list
                batch.update(taskRef, {
                    trigger : taskData.trigger? !taskData.trigger : true
                });

                await batch.commit();

                //triggerRefreshTask();
                setAlertComment({ ...alertComment, message: `Success Modify Comment`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else 
            {
                const errItem = taskDoc.exists() ? "Comment" : "Task"
                console.log(`Firebase ${errItem} Not Exist`, error);
                setAlertComment({ ...alertComment, message: `${errItem} Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch (error) {
            console.log("Modify Firebase Task Fail", error);
            setAlertComment({ ...alertComment, message: 'Modify Task Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const removeComment = async({commentID, taskID})=>{

        try
        {
            const {docRef:commentRef, docObj:commentDoc, docData:commentData} = await getCollectionDocByRefAndID(commentCollectionRef, commentID);
            //const {docRefList:userDocRefList, docObjList:userDocObjList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            // If Comment doc exist
            if (commentDoc.exists()) // &&
                //userDocRefList.length > 0)
            {
                //setTaskIsLoading(true);

                // would remove all the comments (reply) under the parent comment
                await reclusiveRemoveDoc(commentCollectionRef, "replyIDs", commentID);

                // Get Related Task Collection
                const {docRef:taskRef, docObj:taskDoc, docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

                const taskName = taskData.title;

                const batch = writeBatch(db);

                batch.update(taskRef, {
                    commentIDs : arrayRemove(commentID)
                })

                 // Trigger to hit the snap listening
                 batch.update(taskRef, {
                    trigger : taskData.trigger? !taskData.trigger : true
                });

                await batch.commit();


                //triggerRefreshComment();
                setAlertComment({...alertComment, message:`Success Remove Comment From ${taskName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                //const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Project Not Exist';
                const errMessage = 'Comment Not Exist';
                setAlertComment({...alertComment, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Remove Firebase Comment Fail", error);
            setAlertComment({...alertComment, message:'Remove Comment Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return (
        <commentContext.Provider value={{
            alertComment, setAlertComment,
            createComment, removeComment, editComment
        }}>
            {children}
        </commentContext.Provider>
    )
}

export {useCommentDB, CommentDBProvider}