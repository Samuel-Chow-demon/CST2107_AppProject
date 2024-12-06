import { doc, getDoc, getDocs, query, where } from 'firebase/firestore';

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
                docObjList.push(docObj); 
                docRefList.push(doc.ref);
            }
        });

        // Wait for all the promises to resolve
        await Promise.all(promises);
    }
    return {docRefList, docObjList};
}

const reclusiveRemoveDoc = async(collectionRef, innerIDFieldName, ID)=>{
    const docRef = doc(collectionRef, ID);
    const docObj = await getDoc(docRef);

    if (docObj.exists())
    {
        const docData = docObj.data()
        if (innerIDFieldName in docData &&
            docData[innerIDFieldName] != "")
        {
            await reclusiveRemoveDoc(collectionRef, innerIDFieldName, docData[innerIDFieldName]);
        }

        await deleteDoc(docRef);
    }
}

export {getCollectionDocByRefAndID,
        getCollectionDocsByMultipleRefAndID,
        getCollectionDocByRefAndMatchField,
        reclusiveRemoveDoc
};