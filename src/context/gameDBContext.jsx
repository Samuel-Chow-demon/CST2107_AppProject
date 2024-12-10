import { createContext, useContext, useEffect, useState } from 'react';
import { deleteDoc, addDoc, doc, getDoc, getDocs, limit, query, setDoc, where, updateDoc, arrayRemove, onSnapshot, writeBatch } from 'firebase/firestore';
import { userCollectionRef, gameCollectionRef } from '../fireStore/database.js';
import userContext from './userContext.js';
import { arrayUnion } from 'firebase/firestore';
import {getCollectionDocByRefAndID, getCollectionDocByRefAndMatchField, getCollectionDocByRefAndTopMostFieldValue} from '../components/DBUtility.js'
import { db } from '../firebaseConfig.js';

const gameContext = createContext();

// Create Custom Hooks to return useContext(workspaceContext)
const useGameDB = () => useContext(gameContext);

const GameDBProvider = ({children})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const [alertGame, setAlertGame] = useState({});

    const [currentUserGameScoreDoc, setCurrentUserGameScoreDoc] = useState({});

    const [isLoadingData, setIsLoadingData] = useState(true);

    const [allGameUserScoreList, setAllGameUserScoreList] = useState([]);
    const [currentGame, setCurrentGame] = useState("");
    const [displayTopNum, setDisplayTopNum] = useState(10);

    useEffect(()=>{
        setAlertGame({...alertGame, message:'', isOpen: false });
    }, []);

    const callbackRefreshUserGameScore = async(snapShot)=>{

        // {
        //     {uid:id, userName:xxx, scores:{snake:xxxx, otherGame:xxxxx}},
        //     {uid:id2, userName:xxx2, scores:{snake:xxxx, otherGame:xxxxx}}
        // }

        const {docRefList:userGameDocRefList, docObjList:userGameDocObjList} = await getCollectionDocByRefAndMatchField(gameCollectionRef, "uid", _currentUser.uid);

        if (userGameDocRefList.length > 0)
        {
            setCurrentUserGameScoreDoc(userGameDocObjList[0]);
        }
        else
        {
            setCurrentUserGameScoreDoc({});
        }

        const {docRefList:allUserGameDocRefList, 
               docObjList:allUserGameDocObjList} = await getCollectionDocByRefAndTopMostFieldValue(gameCollectionRef, `scores.${currentGame}`, displayTopNum);

        setAllGameUserScoreList(allUserGameDocObjList);

        setIsLoadingData(false);

        // snapShot.docChanges().forEach((change) => {

        //     if (change.type === "added") 
        //     {
        //         console.log("New User added:", change.doc.data());
        //     }

        //     if (change.type === "modified") 
        //     {
        //         console.log("User Score modified:", change.doc.data());
        //     }

        //     if (change.type === "removed") 
        //     {
        //         console.log("User Score removed:", change.doc.id);
        //     }
        // });
    }


    useEffect(()=>{

        let unsubscribeGameCollection = null;

        if (currentGame != "")
        {
            if (unsubscribeGameCollection)
            {
                unsubscribeGameCollection();
            }

            // {
            //     {uid:id, userName:xxx, scores:{snake:xxxx, otherGame:xxxxx}},
            //     {uid:id2, userName:xxx2, scores:{snake:xxxx, otherGame:xxxxx}}
            // }

            unsubscribeGameCollection = onSnapshot(
                gameCollectionRef,
                (snapshot)=>callbackRefreshUserGameScore(snapshot),
                (error) => {
                    console.error("Real-time Listening Game Score DB Fail", error);
                    setAlertGame({
                        ...alertGame,
                        message: 'Real-time Listening Game Score DB Fail',
                        color: 'error',
                        isOpen: true,
                        hideDuration: 2000,
                    });
                }
            );
        }
        
        // clear up
        return ()=>{
            if (unsubscribeGameCollection)
            {
                unsubscribeGameCollection();
            }
        }

    }, [currentGame, displayTopNum]) // when current switch, change to 

    const createScoreRecord = async ({uid, userName, game, score})=>{

        try
        { 
            //setGameIsLoading(true);

            const batch = writeBatch(db);

            //{uid:id, userName:xxx, scores:{snake:xxxx, otherGame:xxxxx}}
            const newUserScoreRef = doc(gameCollectionRef);
            batch.set(newUserScoreRef, {
                id:newUserScoreRef.id,
                uid:uid,
                userName: userName,
                scores : {[game]:score}
            })

            await batch.commit();

            //triggerRefreshGame();
            setAlertGame({...alertGame, message:`Success Added User ${userName} Score ${score}`, color: 'success', isOpen: true, hideDuration: 1500 });
            
        }
        catch(error)
        {
            console.log("Add Firebase User Game Score Fail", error);
            setAlertGame({...alertGame, message:'Add New User Game Score Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    const editScoreRecord = async ({game, score}) => {

        if (currentUserGameScoreDoc?.id)
        {
            try {
                const {docRef:userScoreRef, docObj:userSocreDoc, docData:userScoreData} = await getCollectionDocByRefAndID(gameCollectionRef, currentUserGameScoreDoc.id);
    
                if (userSocreDoc.exists())
                {
                    //setGameIsLoading(true);
    
                    const batch = writeBatch(db);
    
                    batch.set(userScoreRef, {
                        ...userScoreData,
                        scores:{...userScoreData.score, [game]:score}
                    }, {merge: true});
    
                    await batch.commit();
    
                    //triggerRefreshGame();
                    setAlertGame({ ...alertGame, message: `Updated ${userScoreData.userName} Score`, color: 'success', isOpen: true, hideDuration: 1500 });
                }
                else 
                {
                    console.log(`Firebase User Score Doc Not Exist`, error);
                    setAlertGame({ ...alertGame, message: `Firebase User Score Doc Not Exist`, color: 'error', isOpen: true, hideDuration: 2000 });
                }
            }
            catch (error) {
                console.log("Modify Firebase Game Score Fail", error);
                setAlertGame({ ...alertGame, message: 'Modify Game Score Fail', color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
    }

    const removeUserScoreDoc = async({id})=>{

        try
        {
            const {docRef:userScoreRef, docObj:userSocreDoc, docData:userScoreData} = await getCollectionDocByRefAndID(gameCollectionRef, id);
            
            if (userSocreDoc.exists())
            {
                //setGameIsLoading(true);
                
                const batch = writeBatch(db);

                const userName = userScoreData.userName;

                batch.delete(userScoreRef);

                await batch.commit();

                //triggerRefreshGame();
                setAlertGame({...alertGame, message:`Success Remove Game User ${userName}`, color: 'success', isOpen: true, hideDuration: 1500 });
            }
            else
            {
                const errMessage = 'User Game Record Not Exist';
                setAlertGame({...alertGame, message:errMessage, color: 'error', isOpen: true, hideDuration: 2000 });
            }
        }
        catch(error)
        {
            console.log("Remove Firebase Task Fail", error);
            setAlertGame({...alertGame, message:'Remove Task Fail', color: 'error', isOpen: true, hideDuration: 2000 });
        }
    }

    return (
        <gameContext.Provider value={{
            alertGame, setAlertGame, setCurrentGame,
            isLoadingData, allGameUserScoreList, currentUserGameScoreDoc,
            createScoreRecord, removeUserScoreDoc, editScoreRecord
        }}>
            {children}
        </gameContext.Provider>
    )
}

export {useGameDB, GameDBProvider}