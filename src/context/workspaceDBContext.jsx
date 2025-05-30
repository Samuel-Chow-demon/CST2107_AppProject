import { addDoc, arrayRemove, arrayUnion, onSnapshot, query, setDoc, where, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    getCollectionDocByRefAndID,
    getCollectionDocByRefAndMatchField,
    removeAllProjectsFromWSDoc,
    getExpireDate, guestExpireConfig,
    getCollectionDocsByMultipleRefAndDataInSpecificField
} from '../components/DBUtility.js';
import { db } from '../firebaseConfig.js';
import {
    userCollectionRef, workSpaceCollectionRef
} from '../fireStore/database.js';
import userContext from './userContext.js';

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

        let unsubscribeWS;

        const getFireBaseWS = async ()=>{

            try
            {
                // Unsubscribe every render to avoid memory leaks, then below do the subscribe again
                if (unsubscribeWS)
                {
                    unsubscribeWS();
                }

                // Real-time listener for project collection, more efficiency since not to raise the DB connection for each project document ID
                unsubscribeWS = onSnapshot(
                    query(workSpaceCollectionRef, where('userUIDs', "array-contains", _currentUser.uid)),
                    (snapshot) => {
                        const allWorkSpace = [];
                        snapshot.forEach((doc) => {
                            allWorkSpace.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });

                        setworkingWorkSpace(allWorkSpace);

                        setWSIsLoading(false);
                    },
                    (error) => {
                        console.error("Real-time Listening Workspace DB Fail", error);
                        setAlertProject({
                            ...alertProject,
                            message: 'Real-time Listening Workspace DB Fail',
                            color: 'error',
                            isOpen: true,
                            hideDuration: 2000,
                        });
                        setWSIsLoading(false);
                    }
                );
            }
            catch(error)
            {
                setWSIsLoading(false);
                console.log("Get Firebase Current Working WorkSpace Fail", error);
                setAlertWorkSpace({...alertWorkSpace, message:'Get Firebase Current Working WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }

        if (_currentUser &&
            _currentUser.uid)
        {
            getFireBaseWS()
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeWS)
            {
                unsubscribeWS();
            }
        };

    }, [isWorkSpaceUpdate, _currentUser?.loggedIn, _currentUser?.isUpdating])

    useEffect(()=>{
        setAlertWorkSpace({...alertWorkSpace, message:'', isOpen: false });
    }, []);

    const createWorkSpace = async ({formData})=>{

        try
        {
            //setWSIsLoading(true);

            let newWSDocObj = {
                ...formData,
                projectIDs : []
            }

            if (_currentUser?.isGuest)
            {
                const getDate = getExpireDate(guestExpireConfig);

                // console.log(`now: ${getDate.now.toDate()}`);
                // console.log(`expire: ${getDate.expire.toDate()}`);

                newWSDocObj = {
                    ...newWSDocObj,
                    expiredAt : getDate.expire
                }
            }

            const workSpaceRef = await addDoc(workSpaceCollectionRef, newWSDocObj);

            await joinWorkSpace({workspaceID:workSpaceRef.id, userUID:formData.creatorUID});

            triggerRefreshWorkSpace();
            setAlertWorkSpace({...alertWorkSpace, message:`Success Added New WorkSpace ${name}`, color: 'success', isOpen: true, hideDuration: 1500 });
        }
        catch(error)
        {
            console.log("Add Firebase WorkSpace Fail", error);
            setAlertWorkSpace({...alertWorkSpace, message:'Add New WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editWorkSpace = async ({formData, workspaceID}) => {

        try {
            const { docRef: workspaceRef, docObj: workspaceDoc, docData: workspaceData } = await getCollectionDocByRefAndID(workSpaceCollectionRef, workspaceID);

            if (workspaceDoc.exists()) 
            {
                //setWSIsLoading(true);

                await setDoc(workspaceRef, formData, {merge: true});

                triggerRefreshWorkSpace();
                setAlertWorkSpace({ ...alertWorkSpace, message: `Success Modify WorkSpace ${workspaceData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else {
                console.log("Firebase Project Not Exist", error);
                setAlertWorkSpace({ ...alertWorkSpace, message: `WorkSpace Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch (error) {
            console.log("Modify Firebase Project Fail", error);
            setAlertWorkSpace({ ...alertWorkSpace, message: 'Modify WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
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
                //setWSIsLoading(true);

                const batch = writeBatch(db);

                batch.update(workSpaceRef, {
                        userUIDs : arrayUnion(userUID)
                    });

                batch.update(userDocRefList[0], {
                        workspaceIDs : arrayUnion(workspaceID)
                    })

                await batch.commit();

                // Update Work Space Collection
                // await updateDoc(workSpaceRef, {
                //     userUIDs : arrayUnion(userUID)
                // });

                // // Update User Collection
                // await updateDoc(userDocRefList[0], {
                //     workspaceIDs : arrayUnion(workspaceID)
                // })

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
                //setWSIsLoading(true);

                const batch = writeBatch(db);

                batch.update(workSpaceRef, {
                        userUIDs : arrayRemove(userUID)
                    });

                batch.update(userDocRefList[0], {
                        workspaceIDs : arrayRemove(workspaceID)
                    })

                await batch.commit();

                // // Update Work Space Collection
                // await updateDoc(workSpaceRef, {
                //     userUIDs : arrayRemove(userUID)
                // });

                //  // Update User Collection
                //  await updateDoc(userDocRefList[0], {
                //     workspaceIDs : arrayRemove(workspaceID)
                // })

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
                //setWSIsLoading(true);

                // ------------------- The 1st step, remove all the comments, tasks, states and projects sequentially -------------- //
                await removeAllProjectsFromWSDoc(workSpaceData);

                const workSpaceName = workSpaceData.name;

                const batch = writeBatch(db);

                batch.delete(workSpaceDocRef);
                batch.update(userDocRefList[0], {
                        workspaceIDs : arrayRemove(workspaceID)
                    })

                await batch.commit();

                // await deleteDoc(workSpaceDocRef);

                // // Update User Collection
                // await updateDoc(userDocRefList[0], {
                //     workspaceIDs : arrayRemove(workspaceID)
                // })

                triggerRefreshWorkSpace();
                setAlertWorkSpace({...alertWorkSpace, message:`Success Remove WorkSpace ${workSpaceName}`, color: 'success', isOpen: true, hideDuration: 1500 });
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

    const removeWorkSpaceByRefAndDocData = async({workSpaceRef, workSpaceDocData})=>{

        let message = "";
        try
        {
            const workSpaceDocID = workSpaceRef.id;

            // ------------------- The 1st step, remove all the comments, tasks, states and projects sequentially -------------- //
            await removeAllProjectsFromWSDoc(workSpaceDocData);

            // ------------------- The 2nd Step, get all user ref to remove the workspace id from the user doc
            // list of {docRef,  docObj}
            const allUsersObjInWS = await getCollectionDocsByMultipleRefAndDataInSpecificField(userCollectionRef, "uid", workSpaceDocData.userUIDs);

            console.log(allUsersObjInWS);

            // -------------------- The 3rd Step, remove the WS Ref and the corresponding userRef to remove the WS ID from the workspaceIDs field
            const batch = writeBatch(db);

            batch.delete(workSpaceRef);

            allUsersObjInWS.forEach((docObj)=>{

                batch.update(docObj.docRef, {
                    workspaceIDs : arrayRemove(workSpaceDocID)
                })
            })

            await batch.commit();

            message = "OK";
        }
        catch(error)
        {
            message = `Remove WorkSpace Fail : ${error}`
        }

        return {
            message : message,
            data : workSpaceDocData
        }
    }

    return (
        <workspaceContext.Provider value={{
            workingWorkSpace, 
            alertWorkSpace, setAlertWorkSpace,
            isWSLoading, setWSIsLoading, isWorkSpaceUpdate,
            createWorkSpace, joinWorkSpace, removeWorkSpace, leaveWorkSpace, editWorkSpace,
            removeWorkSpaceByRefAndDocData
        }}>
            {children}
        </workspaceContext.Provider>
    )
}

export { useWorkSpaceDB, WorkSpaceDBProvider };
