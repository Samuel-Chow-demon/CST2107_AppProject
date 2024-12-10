import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove, onSnapshot, writeBatch } from 'firebase/firestore';
import { userCollectionRef, workSpaceCollectionRef,
    projectCollectionRef, projectStateCollectionRef,
    taskCollectionRef, commentCollectionRef} from '../fireStore/database.js';
import userContext from './userContext.js';
import { arrayUnion } from 'firebase/firestore';
import {getCollectionDocByRefAndID,
        getCollectionDocByRefAndMatchField,
        reclusiveRemoveDoc,
        removeAllStatesFromProjectDoc} from '../components/DBUtility.js'
import { useWorkSpaceDB } from './workspaceDBContext.jsx';
import { useUserDB } from './userDBContext.jsx';
import { db } from '../firebaseConfig.js';

const projectContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useProjectDB = () => useContext(projectContext);

const ProjectDBProvider = ({children, workingWorkSpaceID})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const { isWorkSpaceUpdate } = useWorkSpaceDB();

    const [alertProject, setAlertProject] = useState({});
    const [isProjectUpdate, setProjectUpdate] = useState(false)

    const [workSpaceData, setWorkSpaceData] = useState({});

    const { getUserDocData } = useUserDB();
    const [allUserInWorkSpaceDoc, setAllUserInWorkSpaceDoc] = useState([]);

    const [projectInfo, setProjectInfo] = useState({
        name : "",
        description : "",
        startDateISO : "",
        endDateISO : "",
        memberUIDs : [],
        stateIDs : [],
        creatorUID : "",
        projectColor: "",
        workspaceID : workingWorkSpaceID
    })

    const [workingProjects, setworkingProjects] = useState([]);

    const [isProjLoading, setProjIsLoading] = useState(true)

    const triggerRefreshProject = ()=>{
        setProjectUpdate(!isProjectUpdate)
    }

    // Load to get the current workspace projects
    useEffect(()=>{

        let unsubscribeProjects;

        const getFireBaseWSProjects = async ()=>{

            try
            {
                //const allWorkSpaceProjects = [];

                const {docRef:workSpaceRef, docObj:workSpaceDoc, docData:workSpaceData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, workingWorkSpaceID);

                // If workspace exists
                if (workSpaceDoc.exists())
                {
                    setWorkSpaceData(workSpaceData);

                    setAllUserInWorkSpaceDoc(await getUserDocData(workSpaceData.userUIDs));

                    // for (const projectID of workSpaceData.projectIDs)
                    // {
                    //     const {docRef:projRef, docObj:projDoc, docData:projData} = await getCollectionDocByRefAndID(projectCollectionRef, projectID);
    
                    //     if (projDoc.exists())
                    //     {
                    //         allWorkSpaceProjects.push({
                    //             id: projRef.id,
                    //             ...projData
                    //         })
                    //     }
                    // }

                    // Unsubscribe every render to avoid memory leaks, then below do the subscribe again
                    if (unsubscribeProjects)
                    {
                        unsubscribeProjects();
                    }

                    // Real-time listener for project collection, more efficiency since not to raise the DB connection for each project document ID
                    unsubscribeProjects = onSnapshot(
                        query(projectCollectionRef, where('workspaceID', '==', workingWorkSpaceID)),
                        (snapshot) => {
                            const allProjects = [];
                            snapshot.forEach((doc) => {
                                allProjects.push({
                                    id: doc.id,
                                    ...doc.data()
                                });
                            });

                            setworkingProjects(allProjects);

                            setProjIsLoading(false);
                        },
                        (error) => {
                            console.error("Real-time Listening Project DB Fail", error);
                            setAlertProject({
                                ...alertProject,
                                message: 'Real-time Listening Project DB Fail',
                                color: 'error',
                                isOpen: true,
                                hideDuration: 2000,
                            });
                            setProjIsLoading(false);
                        }
                    );
                }
                else
                {
                    setProjIsLoading(false);
                    console.log("Firebase WorkSpace Not Exist", error);
                    setAlertProject({...alertProject, message:'Firebase WorkSpace Not Exist', color: 'error', isOpen: true, hideDuration: 2000 });
                }
                //setworkingProjects(allWorkSpaceProjects);
            }
            catch(error)
            {
                setProjIsLoading(false);
                console.log("Firebase Get WorkSpace Project Fail", error);
                setAlertProject({...alertProject, message:'Firebase Get Current WorkSpace Project Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }

        if (_currentUser &&
            _currentUser.uid)
        {
            getFireBaseWSProjects()
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeProjects)
            {
                unsubscribeProjects();
            }
        };

    }, [isProjectUpdate, _currentUser?.loggedIn, _currentUser?.isUpdating, isWorkSpaceUpdate, workingWorkSpaceID])

    useEffect(()=>{
        setAlertProject({...alertProject, message:'', isOpen: false });
    }, []);

    const createProject = async ({formData})=>{

        try
        {
            const {docRef:workSpaceRef, docObj:workSpaceDoc, docData:workSpaceData} = await getCollectionDocByRefAndID(workSpaceCollectionRef, workingWorkSpaceID);

            if (workSpaceDoc.exists())
            {
                //setProjIsLoading(true);

                const batch = writeBatch(db);

                const newProjectRef = doc(projectCollectionRef);
                batch.set(newProjectRef, {
                    ...formData,
                    stateIDs : [],
                    workspaceID : workingWorkSpaceID
                });

                batch.update(workSpaceRef, {
                        projectIDs : arrayUnion(newProjectRef.id)
                    });

                await batch.commit();

                // const projectRef = await addDoc(projectCollectionRef, {
                //     ...formData,
                //     stateIDs : [],
                //     workspaceID : workingWorkSpaceID
                // });

                // // Update Work Space Collection
                // await updateDoc(workSpaceRef, {
                //     projectIDs : arrayUnion(projectRef.id)
                // });

                triggerRefreshProject();
                setAlertProject({...alertProject, message:`Success Added New Project ${formData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                console.log("Firebase WorkSpace Not Exist", error);
                setAlertProject({...alertProject, message:`Work Space Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Add Firebase WorkSpace Project Fail", error);
            setAlertProject({...alertProject, message:'Add New Project Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editProject = async ({formData, projectID}) => {

        try {
            const { docRef: projectRef, docObj: projectDoc, docData: projectData } = await getCollectionDocByRefAndID(projectCollectionRef, projectID);

            if (projectDoc.exists()) 
            {
                //setProjIsLoading(true);

                await setDoc(projectRef, formData, {merge: true});

                triggerRefreshProject();
                setAlertProject({ ...alertProject, message: `Success Modify Project ${projectData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else {
                console.log("Firebase Project Not Exist", error);
                setAlertProject({ ...alertProject, message: `Project Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch (error) {
            console.log("Modify Firebase Project Fail", error);
            setAlertProject({ ...alertProject, message: 'Modify Project Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const joinProject = async({projectID, userUID})=>{

        try
        {
            const {docRef:projectRef, docObj:projectDoc, docData:projectData} = await getCollectionDocByRefAndID(projectCollectionRef, projectID);
            const {docRefList:userDocRefList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            if (projectDoc.exists() &&
                userDocRefList.length > 0)
            {
                //setProjIsLoading(true);

                // Update Work Space Collection
                await updateDoc(projectRef, {
                    memberUIDs : arrayUnion(userUID)
                });

                const userData = userDocObjList[0].data();

                triggerRefreshProject();
                setAlertProject({...alertProject, message:`${userData.userName} Success Joined Project ${projectData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Project Not Exist';
                setAlertProject({...alertProject, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Join Firebase Project Fail", error);
            setAlertProject({...alertProject, message:'Join WorkSpace Project Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const leaveProject = async({projectID, userUID})=>{

        try
        {
            const {docRef:projectRef, docObj:projectDoc, docData:projectData} =  await getCollectionDocByRefAndID(projectCollectionRef, projectID);
            const {docRefList:userDocRefList, docObjList:userDocObjList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            if (projectDoc.exists() &&
                userDocRefList.length > 0)
            {
                //setProjIsLoading(true);

                // Update Project Collection
                await updateDoc(projectRef, {
                    memberUIDs : arrayRemove(userUID)
                });

                const userData = userDocObjList[0].data();

                triggerRefreshProject();
                setAlertProject({...alertProject, message:`${userData.userName} Success Left Project ${projectData.name}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Project Not Exist';
                setAlertProject({...alertProject, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Leave Firebase WorkSpace Fail", error);
            setAlertProject({...alertProject, message:'Leave WorkSpace Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const removeProject = async({projectID, userUID})=>{

        try
        {
            const {docRef:projectRef, docObj:projectDoc, docData:projectData} =  await getCollectionDocByRefAndID(projectCollectionRef, projectID);
            //const {docRefList:userDocRefList, docObjList:userDocObjList} = await getCollectionDocByRefAndMatchField(userCollectionRef, "uid", userUID);

            // Here should get all the linked database id, and remove the inner child first
            // Remove all the Task doc
            // Remove all the related Work State doc
            // Remove the workspace project list
            // Remove the Project doc

            // If Project doc exist
            if (projectDoc.exists()) // &&
                //userDocRefList.length > 0)
            {
                //setProjIsLoading(true);
 
                // ------------------- The 1st step, remove all the comments, tasks and states sequentially -------------- //
                await removeAllStatesFromProjectDoc(projectData);

                // ------------------- The 2nd step -------------- //
                const projectName = projectData.name;
                
                const {docRef:workSpaceDocRef} = await getCollectionDocByRefAndID(workSpaceCollectionRef, projectData.workspaceID);

                const batchStep2 = writeBatch(db);

                batchStep2.delete(projectRef);
                batchStep2.update(workSpaceDocRef, {
                    projectIDs : arrayRemove(projectID)
                })

                await batchStep2.commit();

                // await deleteDoc(projectRef);

                // await updateDoc(workSpaceDocRef, {
                //     projectIDs : arrayRemove(projectID)
                // })

                triggerRefreshProject();
                setAlertProject({...alertProject, message:`Success Remove Project ${projectName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                //const errMessage = userDocRefList.length <= 0 ? 'User UID Not Exist' : 'Project Not Exist';
                const errMessage = 'Project Not Exist';
                setAlertProject({...alertProject, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Remove Firebase Project Fail", error);
            setAlertProject({...alertProject, message:'Remove Project Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return (
        <projectContext.Provider value={{
            workingProjects, workSpaceData, allUserInWorkSpaceDoc,
            alertProject, setAlertProject,
            isProjLoading, setProjIsLoading, isProjectUpdate,
            createProject, joinProject, removeProject, leaveProject, editProject
        }}>
            {children}
        </projectContext.Provider>
    )
}

export {useProjectDB, ProjectDBProvider}