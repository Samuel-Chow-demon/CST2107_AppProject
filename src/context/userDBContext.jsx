import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove, writeBatch } from 'firebase/firestore';
import { userCollectionRef, workSpaceCollectionRef } from '../fireStore/database';
import userContext from './userContext';
import { arrayUnion } from 'firebase/firestore';
import { getRandomRGBString } from '../components/utility';

import { db } from '../firebaseConfig.js';

import {getExpireDate, guestExpireConfig} from '../components/DBUtility'

const userDBContext = createContext();

// Create Custom Hooks to return useContext()
const useUserDB = () => useContext(userDBContext);

const UserDBProvider = ({children})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const [alertUserDB, setAlertUserDB] = useState({});
    const [isUserDBUpdate, setUserDBUpdate] = useState(false);

    const [userInfoDB, setUserInfoDB] = useState({
        userName : _currentUser?.userName,
        email : _currentUser?.email,
        uid : _currentUser?.uid,
        workspaceIDs : []
    })

    const [isUserDBLoading, setUserDBIsLoading] = useState(true)

    // Load to get the current user included workspace
    useEffect(()=>{

        const getFireBaseUserDB = async ()=>{

            // If the currentUser logged in
            if (_currentUser != null &&
                _currentUser.loggedIn)
            {
                try
                {
                    const queryDoc = query(userCollectionRef, where("uid", "==", _currentUser.uid), limit(1));
                
                    const userQuerySnapShot = await getDocs(queryDoc);

                    const loginUserColor = getRandomRGBString().solid;

                    let updatedCurrentUser = {
                        ..._currentUser,
                        color:loginUserColor
                    }
                    
                    // If missed or not ever existed in the DB for the current logged in user
                    if (userQuerySnapShot.empty)
                    {
                        // Do add back to the DB doc
                        const userDocRef = createUserDB(updatedCurrentUser);
                    }
                    // Update back the user belonged Workspace
                    else
                    {
                        // Find the workspace that already registered the user uid, synchronize back
                        let userBelongWS = [];
                        const queryWSDoc = query(workSpaceCollectionRef, where("userUIDs", "array-contains", _currentUser.uid));
                        const wsQuerySnapShot = await getDocs(queryWSDoc);
                        if (!wsQuerySnapShot.empty)
                        {
                            userBelongWS = wsQuerySnapShot.docs.map(doc => doc.id);
                        }

                        // Update back the WS Doc ID list
                        const userDocRef = userQuerySnapShot.docs[0].ref;
                        await updateDoc(userDocRef, {
                            workspaceIDs : userBelongWS.length > 0 ? arrayUnion(...userBelongWS) : [],
                            color:loginUserColor
                        })
    
                        let docUser = await getDoc(userDocRef);
    
                        if (docUser.exists())
                        {
                            let data = docUser.data();
                            const workspaceIDs = data.workspaceIDs;

                            // Update back to all available workspace if missing the userID
                            const promises = workspaceIDs.map(async (workspaceID)=>{

                                const wsDocRef = doc(workSpaceCollectionRef, workspaceID);

                                const getWSDocAndUpdate = async()=>{
                                    const wsDocSnap = await getDoc(wsDocRef); 
                                     
                                    if (wsDocSnap.exists())
                                    {
                                        await updateDoc(wsDocRef, {
                                            userUIDs : arrayUnion(_currentUser.uid)
                                        });
                                    }
                                    else
                                    {
                                        await updateDoc(userDocRef,{
                                            workspaceIDs : arrayRemove(workspaceID)
                                        });

                                        // Fetch the updated user document after modifying it
                                        docUser = await getDoc(userDocRef);
                                        data = docUser.data(); // Get the updated data
                                    }
                                }
                                await getWSDocAndUpdate();
                            })

                            // Wait for all the promises to resolve
                            await Promise.all(promises);

                            if (data.isAdmin)
                            {
                                updatedCurrentUser = {
                                    ...updatedCurrentUser,
                                    isAdmin: data.isAdmin
                                }
                            }

                            // Set to State Var
                            setUserInfoDB({
                                userName : data.userName,
                                email : data.email,
                                color: data.color,
                                uid : data.uid,
                                workspaceIDs : data.workspaceIDs
                            })
                        }
                    }

                    setCurrentUser(updatedCurrentUser);
                }
                catch(error)
                {
                    console.log(`Get Firebase Current User ${_currentUser.userName} DB Info Fail`, error);
                    setAlertUserDB({...alertUserDB, message:`Get User ${_currentUser.userName} DB Info Fail`, color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
        }

        getFireBaseUserDB()
        setUserDBIsLoading(false)

    }, [isUserDBUpdate])

    const createUserDB = async (newUser)=>{

        try
        {
            let useUserDBObj = {

                userName: newUser.userName,
                email: newUser.email,
                uid: newUser.uid,
                color: newUser.color,
                loggedIn: newUser.loggedIn ?? false,
                workspaceIDs : []
            };

            if (newUser?.isGuest)
            {
                const getDate = getExpireDate(guestExpireConfig);

                useUserDBObj = {
                    ...useUserDBObj,
                    isGuest: newUser.isGuest,
                    expiredAt: getDate.expire,
                    loggedIn : true
                }
            }

            const userDocRef = await addDoc(userCollectionRef, useUserDBObj);
            return userDocRef;
        }
        catch(error)
        {
            console.log(`Add User ${newUser.userName} Fail`, error);
            setAlertUserDB({...alertUserDB, message:'Add New User Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            return null;
        }
    }

    const updateUserDB = async ({uid, groupObjValue})=>{

        try
        {
            const queryDoc = query(userCollectionRef, where("uid", "==", uid), limit(1));
            const userQuerySnapShot = await getDocs(queryDoc);

            if (!userQuerySnapShot.empty)
            {
                const userRef = userQuerySnapShot.docs[0].ref;
                const userDoc = await getDoc(userRef);
                const userData = userDoc.data();

                if (userDoc.exists())
                {
                    await updateDoc(userRef, {
                        ...userData,
                        ...groupObjValue
                    }); 
                }
                else
                {
                    setAlertUserDB({...alertUserDB, message:'User DB Doc Not Exist', color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
            else
            {
                setAlertUserDB({...alertUserDB, message:'User Not Exist', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log(`Add User {userName} Fail`, error);
            setAlertUserDB({...alertUserDB, message:'Add New User Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const getAllUserDoc = async()=>{

        try
        {
            const querySnapshot = await getDocs(userCollectionRef);
            const userDocDataList = querySnapshot.docs.map(doc => ({
                ...doc.data() // Document data
            }));

            return userDocDataList;
        }
        catch (error)
        {
            console.log(`Get All User Docs Fail`, error);
            setAlertUserDB({...alertUserDB, message:'Get All User Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            return [];
        }
    }

    const getUserDocData = async(requestUserUIDList)=>{

        try
        {
            const querySnapshot = await getDocs(userCollectionRef);
            const userDocDataList = querySnapshot.docs
                .filter(doc=>requestUserUIDList.includes(doc.data().uid))
                .map(doc => ({
                    ...doc.data() // Document data
                    }));

            return userDocDataList;
        }
        catch (error)
        {
            console.log(`Get User Docs Fail`, error);
            setAlertUserDB({...alertUserDB, message:'Get User Doc Data Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            return [];
        }
    }

    const removeUserByRefAndDocData = async({userRef, userDocData})=>{

        let message = "";
        try
        {
            const batch = writeBatch(db);

            batch.delete(userRef);

            await batch.commit();

            message = "OK";
        }
        catch(error)
        {
            message = `Remove User Fail : ${error}`
        }

        return {
            message : message,
            data : userDocData
        }
    }

    const checkIfUserDocExist = async({uid})=>{

        const queryDoc = query(userCollectionRef, where("uid", "==", uid), limit(1));
                
        const userQuerySnapShot = await getDocs(queryDoc);

        return !userQuerySnapShot.empty;
    }

    return (
        <userDBContext.Provider value={{
            userInfoDB,
            alertUserDB, setAlertUserDB,
            isUserDBLoading,
            setUserDBUpdate,
            createUserDB, updateUserDB,
            getAllUserDoc, getUserDocData,
            removeUserByRefAndDocData,
            checkIfUserDocExist
        }}>
            {children}
        </userDBContext.Provider>
    )
}

export {useUserDB, UserDBProvider}