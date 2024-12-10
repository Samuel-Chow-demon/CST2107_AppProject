import { doc, getDoc, getDocs, limit, orderBy, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { userCollectionRef, workSpaceCollectionRef,
        projectCollectionRef, projectStateCollectionRef,
        taskCollectionRef, commentCollectionRef} from '../fireStore/database.js';

const getCollectionDocByRefAndID = async(collectionRef, ID)=>{
    const docRef = doc(collectionRef, ID);
    const docObj = await getDoc(docRef);
    const docData = docObj.exists() ? docObj.data() : null;
    return {docRef, docObj, docData};
}

const getCollectionDocsByMultipleRefAndID = async (collectionRef, IDArray) => {
    if (!Array.isArray(IDArray))
    {
        throw new Error("IDs must be an array");
    }
    
    const docPromises = IDArray.map(async (ID) => {
        const docRef = doc(collectionRef, ID);
        const docObj = await getDoc(docRef);
        const docData = docObj.exists() ? docObj.data() : null;
        return { docRef, docObj, docData };
    });

    const idsDocs = await Promise.all(docPromises);
    return idsDocs;
};

const getCollectionDocByRefAndMatchField = async(collectionRef, field, value)=>{

    // can have multiple docs that match
    const queryDoc = query(collectionRef, where(field, "==", value));
    const querySnapShot = await getDocs(queryDoc);

    let docRefList = []
    let docObjList = []

    if (!querySnapShot.empty)
    {
        const promises = querySnapShot.docs.map(async (doc) => {
            const docObj = await getDoc(doc.ref);

            if (docObj.exists()) {
                docObjList.push({id:docObj.id, ...docObj.data()}); 
                docRefList.push(doc.ref);
            }
        });

        // Wait for all the promises to resolve
        await Promise.all(promises);
    }
    return {docRefList, docObjList};
}

const getCollectionDocByRefAndTopMostFieldValue = async(collectionRef, field, topMostSize)=>{

  // can have multiple docs that match
  const queryDoc = query(collectionRef, orderBy(field, "desc"), limit(topMostSize));
  const querySnapShot = await getDocs(queryDoc);

  let docRefList = []
  let docObjList = []

  if (!querySnapShot.empty)
  {
      const promises = querySnapShot.docs.map(async (doc) => {
          const docObj = await getDoc(doc.ref);

          if (docObj.exists()) {
              docObjList.push({id:docObj.id, ...docObj.data()}); 
              docRefList.push(doc.ref);
          }
      });

      // Wait for all the promises to resolve
      await Promise.all(promises);
  }
  return {docRefList, docObjList};
}

// Need to create a Lock Unlock Function for batch delete under multiple thread
class Lock {
    constructor() {
      this.isLocked = false;  // Flag to track lock state
    }
  
    // Acquire the lock, return a promise that resolves when it's unlocked
    acquire() {
      return new Promise((resolve) => {
        const checkLock = () => 
        {
          if (!this.isLocked) 
          {
            this.isLocked = true;
            resolve();  // Lock acquired, resolve the promise
          } 
          else 
          {
            setTimeout(checkLock, 10);  // Retry after 10ms if still locked
          }
        };
        checkLock();
      });
    }
  
    // Release the lock
    release() 
    {
      this.isLocked = false;  // Unlock
    }
}

// Create a thread safe firebase batch
class FireBaseBatchManager 
{
    constructor() {
      this.batch = writeBatch(db);  // Initialize the batch
      this.lock = new Lock();       // Lock instance to ensure thread-safety
    }
  
    // Add delete operation to the batch with thread safety
    async addDelete(ref) {
      await this.lock.acquire();  // Acquire the lock before modifying the batch
      try {
        this.batch.delete(ref);   // Safe to delete after acquiring the lock
      } finally {
        this.lock.release();      // Release the lock after operation
      }
    }
  
    // Commit all delete operations in the batch
    async commit() {
      await this.lock.acquire();  // Ensure no one can add more deletes during commit
      try {
        await this.batch.commit();
        //console.log("Batch commit success");
      } finally {
        this.lock.release();      // Release lock after commit
      }
    }
  }

const reclusiveRemoveDoc = async(collectionRef, innerIDFieldName, ID, parentBatch=null)=>{
    const docRef = doc(collectionRef, ID);
    const docObj = await getDoc(docRef);

    const isParentNode = !parentBatch;

    let batch = null;
    if (!parentBatch)
    {
        batch = new FireBaseBatchManager();
    }

    if (docObj.exists())
    {
        const docData = docObj.data()
        if (innerIDFieldName in docData)
        {
            const docDataContent =  docData[innerIDFieldName];
            // if it is an array, need to loop all with each of them reclusive to the end 
            if (Array.isArray(docDataContent) &&
                docDataContent.length > 0)
            {
                docDataContent.forEach(async(data)=>{
                    await reclusiveRemoveDoc(collectionRef, innerIDFieldName, data, batch);
                })
            }
            else if (docDataContent.length > 0)
            {
                await reclusiveRemoveDoc(collectionRef, innerIDFieldName, docData[innerIDFieldName], batch);
            }
        }

        // Thread safe for muliple Async function to do reclusive action
        batch.addDelete(docRef);

        // Only the parent node finally would commit the batch at once to remove all related doc
        if (isParentNode)
        {
            await batch.commit();
        }
    }
}

const removeAllTasksFromStateDoc = async(stateData) =>{

    const allTaskIDs = stateData.taskIDs;

    const batch = writeBatch(db);

    const promises = allTaskIDs.map(async(taskID)=>{

        // Get all the state doc
        const {docRef:taskDocRef, 
                docObj:taskDoc,
                docData:taskData} = await getCollectionDocByRefAndID(taskCollectionRef, taskID);

        if (taskDoc.exists())
        {
            const allCommentIDs = taskData.commentIDs;

            allCommentIDs.forEach(async(commentID)=>{
                
                await reclusiveRemoveDoc(commentCollectionRef, "replyIDs", commentID);

            })
            //await deleteDoc(taskDocRef);
            // Store all desire delete taskDocRef first
            batch.delete(taskDocRef);
        }
    })

    // Wait all the comments from all the tasks are removed first
    await Promise.all(promises);

    // then call one time to remove all the related tasks Doc
    await batch.commit();

    // await deleteDoc(taskRef);

    // await updateDoc(stateRef, {
    //     taskIDs : arrayRemove(taskID)
    // })
}

const removeAllStatesFromProjectDoc = async(projectData)=>{

    const allStateIDs = projectData.stateIDs;

    const batch = writeBatch(db);

    const promises = allStateIDs.map(async(stateID)=>{
        
        // Get all the state doc
        const {docRef:stateDocRef, 
                docObj:stateDoc,
                docData:stateData} = await getCollectionDocByRefAndID(projectStateCollectionRef, stateID);

        if (stateDoc.exists())
        {
            // ------------------- The 1st Inner step -------------- //
            await removeAllTasksFromStateDoc(stateData);

            //await deleteDoc(stateDocRef);
            batch.delete(stateDocRef);
        }
    })

    // Wait all the comments and tasks from all the States are removed first
    await Promise.all(promises);

    // then call one time to remove all the related State Doc
    await batch.commit();
}

const removeAllProjectsFromWSDoc = async(workSpaceData)=>{

    const allProjectIDs = workSpaceData.projectIDs;

    const batch = writeBatch(db);

    const promises = allProjectIDs.map(async(projectID)=>{

        // Get all the project doc
        const {docRef:projectDocRef, 
                docObj:projectDoc,
                docData:projectData} = await getCollectionDocByRefAndID(projectCollectionRef, projectID);

        if (projectDoc.exists())
        {
            // ------------------- The 1st Inner step -------------- //
            await removeAllStatesFromProjectDoc(projectData);

            //await deleteDoc(projectDocRef);
            batch.delete(projectDocRef);
        }
    })   
    
    // Wait all the comments and tasks from all the States are removed first
    await Promise.all(promises);

    // then call one time to remove all the related State Doc
    await batch.commit();
}

export {getCollectionDocByRefAndID,
        getCollectionDocsByMultipleRefAndID,
        getCollectionDocByRefAndMatchField,
        getCollectionDocByRefAndTopMostFieldValue,
        reclusiveRemoveDoc, 
        removeAllTasksFromStateDoc, removeAllStatesFromProjectDoc, removeAllProjectsFromWSDoc
};