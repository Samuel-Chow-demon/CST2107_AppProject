import {useState, useEffect, useContext, memo} from 'react'

import {
    userCollectionRef,
    workSpaceCollectionRef,
    projectStateCollectionRef,
    projectCollectionRef,
    taskCollectionRef,
    commentCollectionRef
} from '../fireStore/database.js';

import {
    getCollectionDocByRefAndMatchFieldWithComparatorStr
} from '../components/DBUtility.js'

import userContext from '../context/userContext.js';
import { Button, CircularProgress, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { DataGrid } from '@mui/x-data-grid';

import { useCommentDB } from '../context/commentDBContext';
import { useTaskDB } from '../context/taskDBContext.jsx';
import { useStateDB } from '../context/stateDBContext.jsx';
import { useProjectDB } from '../context/projectDBContext.jsx';
import { useWorkSpaceDB } from '../context/workspaceDBContext.jsx';
import { useUserDB } from '../context/userDBContext.jsx';

const collectionCAT = {
    0 : "User",
    1 : "WorkSpace",
    2 : "Project",
    3 : "State",
    4 : "Task",
    5 : "Comment"
};

const Admin = () => {

    const {_currentUser} = useContext(userContext);

    const {removeCommentByDocData} = useCommentDB();
    const {removeTaskByRefAndDocData} = useTaskDB();
    const {removeStateByRefAndDocData} = useStateDB();
    const {removeProjectByRefAndDocData} = useProjectDB();
    const {removeWorkSpaceByRefAndDocData} = useWorkSpaceDB();
    const {removeUserByRefAndDocData} = useUserDB();

    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [selection, setSelection] = useState(-1);

    const [collectionResult, setCollectionResult] = useState({
        ref: [],
        doc: []
    })

    useEffect(()=>{

        if (_currentUser)
        {
            setIsLoading(false);

            if (_currentUser.isAdmin)
            {
                setIsAdmin(true);
            }
        }

    }, [_currentUser]);

    const DynamicTable = memo(({data})=>{

        const columns = data.length > 0 ?
                        Object.keys(data[0]).map((key)=>(
                            {
                                field: key,
                                headerName: key.toUpperCase(),
                                flex: 1
                            }
                        )) : [];

        return (
            <div style={{
                width: "100%",
                height: "600"
            }}>
                <DataGrid 
                    rows={data}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10, page: 0 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    sx={{ border: 0 }}
                />          
            </div>
        );
    });

    const handleSearch = async(selectItem)=>{

        let collectionRef = null;

        switch (Number(selectItem))
        {
            case 0:
                collectionRef = userCollectionRef;
                break;
            case 1:
                collectionRef = workSpaceCollectionRef;
                break;
            case 2:
                collectionRef = projectCollectionRef;
                break;
            case 3:
                collectionRef = projectStateCollectionRef;
                break;
            case 4:
                collectionRef = taskCollectionRef;
                break;
            case 5:
                collectionRef = commentCollectionRef;
                break;
            default:
                break;
        }

        if (collectionRef)
        {
            const {docRefList, docObjList} = await getCollectionDocByRefAndMatchFieldWithComparatorStr(collectionRef, "!=", "expiredAt", null);

            setCollectionResult({
                ref: docRefList,
                doc: docObjList
            })

            setSelection(Number(selectItem));
        }
    }


    const handleRemove = async (e)=>{

        e.preventDefault();

        let promises = null;

        const now = new Date();

       switch (Number(selection))
        {
            // all expired User Doc and remove
            case 0:
                 promises = collectionResult.doc.map(async (doc, index)=> {

                    if (now > doc.expiredAt.toDate())
                    {
                        const ref = collectionResult.ref[index];

                        await removeUserByRefAndDocData({userRef : ref, userDocData : doc});
                    }
                })
                break;

            // all expired WorkSpace Doc and remove
            case 1:
                promises = collectionResult.doc.map(async (doc, index)=> {

                    if (now > doc.expiredAt.toDate())
                    {
                        const ref = collectionResult.ref[index];

                        await removeWorkSpaceByRefAndDocData({workSpaceRef : ref, workSpaceDocData : doc});
                    }
                })
                break;

            // all expired Project Doc and remove
            case 2:
                promises = collectionResult.doc.map(async (doc, index)=> {

                    if (now > doc.expiredAt.toDate())
                    {
                        const ref = collectionResult.ref[index];

                        await removeProjectByRefAndDocData({projectRef : ref, projectDocData : doc});
                    }
                })
                break;

            // all expired State Doc and remove
            case 3:
                promises = collectionResult.doc.map(async (doc, index)=> {

                    if (now > doc.expiredAt.toDate())
                    {
                        const ref = collectionResult.ref[index];

                        await removeStateByRefAndDocData({stateRef : ref, stateDocData : doc});
                    }
                })
                break;

            // all expired Task Doc and remove
            case 4:
                promises = collectionResult.doc.map(async (doc, index)=> {

                    if (now > doc.expiredAt.toDate())
                    {
                        const ref = collectionResult.ref[index];

                        await removeTaskByRefAndDocData({taskRef : ref, taskDocData : doc});
                    }
                })
                break;

            // All expired User Doc and remove
            case 5:
                promises = collectionResult.doc.map(async (doc)=> {

                    if (now > doc.expiredAt.toDate())
                    {
                        await removeCommentByDocData({commentDocData : doc});
                    }
                })
                break;
            default:
                break;
        }

        if (promises)
        {
            await Promise.all(promises);

            // update the table
            handleSearch(selection);
        }
    }

    const ButtonsList = memo(()=>{

        return(
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '2rem'
            }}>
                {
                    Object.entries(collectionCAT).map(([key, value], index)=>(
                        <Button
                            key={index}
                            variant="contained"
                            onClick={()=>handleSearch(key)}
                            sx={{
                                fontSize: '14px'
                            }}
                        >
                            {value}
                        </Button>
                    ))
                }
            </div>
        );
    });

    return (

        <>
            {
                isLoading ?
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: grey[300]
                }}>
                    <CircularProgress sx={{fontSize: '24px'}} /> 
                </div> 
                :
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    padding: '2rem',
                    backgroundColor: grey[300]
                }}>
                    {
                        isAdmin ?
                        <div style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            gap: '2rem'
                        }}>
                            <ButtonsList />
                            <Button 
                                variant='contained'
                                color="secondary"
                                onClick={handleRemove}
                            >
                                Remove
                            </Button>
                            <Typography>{selection >= 0 ? `Guest Collection Table - ${collectionCAT[selection]}` : ""}</Typography>
                            <DynamicTable data={collectionResult.doc} />

                        </div>
                        :
                        <Typography>
                            Not Available
                        </Typography>
                    }
                </div>
            }  
        </>
    )
}

export default Admin