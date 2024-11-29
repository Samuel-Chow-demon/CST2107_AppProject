import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove } from 'firebase/firestore';
import { userCollectionRef, workSpaceCollectionRef,
    projectCollectionRef, projectStateCollectionRef,
    taskCollectionRef, commentCollectionRef} from '../fireStore/database';
import userContext from './userContext';
import { arrayUnion } from 'firebase/firestore';
import {getCollectionDocByRefAndID,
        getCollectionDocByRefAndMatchField,
        reclusiveRemoveDoc} from '../components/DBUtility.js'

const workspaceContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useWorkSpaceDB = () => useContext(workspaceContext);

const WorkSpaceDBProvider = ({children})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const [alertWorkSpace, setAlertWorkSpace] = useState({});
    const [isWorkSpaceUpdate, setWorkSpaceUpdate] = useState(false)

    const [workSpaceInfo, setWorkSpaceInfo] = useState({
        name : "",
        bkgrdColor : "",
        img : "",
        creatorUID : "",
        userUIDs : [],
        projectIDs : []
    })

    const [workingWorkSpace, setworkingWorkSpace] = useState({
        workspace : [],
    })
    const [isWSLoading, setWSIsLoading] = useState(true)

    const triggerRefreshWorkSpace = ()=>{
        setWorkSpaceUpdate(!isWorkSpaceUpdate)
    }

    // Load to get the current user included workspace
    useEffect(()=>{

        const getFireBaseWS = async ()=>{

            try
            {
                const queryDoc = query(workSpaceCollectionRef, where("userUIDs", "array-contains", _currentUser.uid))
            
                const wsQuerySnapShot = await getDocs(queryDoc);

                if (!wsQuerySnapShot.empty)
                {
                    const allWorkSpace = []
                    wsQuerySnapShot.forEach((doc)=>{
                        allWorkSpace.push({
                            id : doc.id,
                            ...doc.data()           // expand the content to the object of allWorkSpace
                        })
                    })
                    setworkingWorkSpace(allWorkSpace);
                }
                else
                {
                    setworkingWorkSpace([]); // empty
                }
            }
            catch(error)
            {
                console.log("Get Firebase Current Working WorkSpace Fail", error);
                setAlertWorkSpace({...alertWorkSpace, message:'Get Firebase Current Working WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }

        if (_currentUser &&
            _currentUser.uid)
        {
            getFireBaseWS()
            setWSIsLoading(false)
        }

    }, [isWorkSpaceUpdate, _currentUser?.loggedIn, _currentUser?.isUpdating])

    useEffect(()=>{
        setAlertWorkSpace({...alertWorkSpace, message:'', isOpen: false });
    }, []);

    const createWorkSpace = async ({name, bkgrdColor, Img, creatorUID})=>{

        try
        {
            setWSIsLoading(true);

            const workSpaceRef = await addDoc(workSpaceCollectionRef, {
                name : name,
                bkgrdColor : bkgrdColor,
                img : Img,
                creatorUID: creatorUID,
                userUIDs : [creatorUID],
                projectIDs : []
            });

            await joinWorkSpace({workspaceID:workSpaceRef.id, userUID:creatorUID});

            triggerRefreshWorkSpace();
            setAlertWorkSpace({...alertWorkSpace, message:`Success Added New WorkSpace ${name}`, color: 'success', isOpen: true, hideDuration: 1500 });
        }
        catch(error)
        {
            console.log("Add Firebase WorkSpace Fail", error);
            setAlertWorkSpace({...alertWorkSpace, message:'Add New WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const joinWorkSpace = async({workspaceID, userUID})=>{

        try
        {
            const {docRef:workSpaceRef, docObj:workSpaceDoc, docData:workSpaceData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, workspaceID);
            const {docRefList:userDocRefList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            if (workSpaceDoc.exists() &&
                userDocRefList.length > 0)
            {
                setWSIsLoading(true);

                // Update Work Space Collection
                await updateDoc(workSpaceRef, {
                    userUIDs : arrayUnion(userUID)
                });

                // Update User Collection
                await updateDoc(userDocRefList[0], {
                    workspaceIDs : arrayUnion(workspaceID)
                })

                triggerRefreshWorkSpace();
                setAlertWorkSpace({...alertWorkSpace, message:`Success Joined WorkSpace ${workSpaceData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                setAlertWorkSpace({...alertWorkSpace, message:'Work Space Not Exist', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Join Firebase WorkSpace Fail", error);
            setAlertWorkSpace({...alertWorkSpace, message:'Join WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const leaveWorkSpace = async({workspaceID, userUID})=>{

        try
        {
            const {docRef:workSpaceRef, docObj:workSpaceDoc, docData:workSpaceData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, workspaceID);
            const {docRefList:userDocRefList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            if (workSpaceDoc.exists() &&
                userDocRefList.length > 0)
            {
                setWSIsLoading(true);

                // Update Work Space Collection
                await updateDoc(workSpaceRef, {
                    userUIDs : arrayRemove(userUID)
                });

                 // Update User Collection
                 await updateDoc(userDocRefList[0], {
                    workspaceIDs : arrayRemove(workspaceID)
                })

                triggerRefreshWorkSpace();
                setAlertWorkSpace({...alertWorkSpace, message:`Success Left WorkSpace ${workSpaceData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Work Space Not Exist';
                setAlertWorkSpace({...alertWorkSpace, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Leave Firebase WorkSpace Fail", error);
            setAlertWorkSpace({...alertWorkSpace, message:'Leave WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const removeWorkSpace = async({workspaceID, userUID})=>{

        try
        {
            const {docRef:workSpaceDocRef, 
                   docObj:workSpaceDoc,
                   docData:workSpaceData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, workspaceID);

            const {docRefList:userDocRefList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            // Here should get all the linked database id, and remove the inner child first
            // Remove all the Task doc
            // Remove all the related Work State doc
            // Remove all the related Project doc
            // final remove the workspace doc

            // If WS doc exist
            if (workSpaceDoc.exists() &&
                userDocRefList.length > 0)
            {
                setWSIsLoading(true);

                const allProjectIDs = workSpaceData.projectIDs;

                allProjectIDs.forEach(async(projectID)=>{

                    // Get all the project doc
                    const {docRef:projectDocRef, 
                            docObj:projectDoc,
                            docData:projectData} = await getCollectionDocByRefAndID(projectCollectionRef, projectID);

                    if (projectDoc.exists())
                    {
                        const allStateIDs = projectData.stateIDs;

                        allStateIDs.forEach(async(stateID)=>{
                            
                            // Get all the state doc
                            const {docRef:stateDocRef, 
                                    docObj:stateDoc,
                                    docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);

                            if (stateDoc.exists())
                            {
                                const allTaskIDs = stateData.taskIDs;

                                allTaskIDs.forEach(async(taskID)=>{

                                    // Get all the state doc
                                    const {docRef:taskDocRef, 
                                            docObj:taskDoc,
                                            docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

                                    if (taskDoc.exists())
                                    {
                                        const allCommentIDs = taskData.commentIDs;

                                        allCommentIDs.forEach(async(commentID)=>{
                                            
                                            await reclusiveRemoveDoc(commentCollectionRef, "replyID", commentID);

                                        })
                                        await deleteDoc(taskDocRef);
                                    }

                                })
                                await deleteDoc(stateDocRef);
                            }
                        })
                        await deleteDoc(projectDocRef);
                    }
                });

                await deleteDoc(workSpaceDocRef);

                // Update User Collection
                await updateDoc(userDocRefList[0], {
                    workspaceIDs : arrayRemove(workspaceID)
                })

                triggerRefreshWorkSpace();
                setAlertWorkSpace({...alertWorkSpace, message:`Success Remove WorkSpace ${workSpaceData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Work Space Not Exist';
                setAlertWorkSpace({...alertWorkSpace, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Remove Firebase WorkSpace Fail", error);
            setAlertWorkSpace({...alertWorkSpace, message:'Remove WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return (
        <workspaceContext.Provider value={{
            workingWorkSpace,
            alertWorkSpace, setAlertWorkSpace,
            isWSLoading,
            createWorkSpace, joinWorkSpace, removeWorkSpace, leaveWorkSpace
        }}>
            {children}
        </workspaceContext.Provider>
    )
}

export {useWorkSpaceDB, WorkSpaceDBProvider}