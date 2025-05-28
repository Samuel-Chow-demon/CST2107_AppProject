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
import { Button, Checkbox, CircularProgress, FormControlLabel, Typography } from '@mui/material';
import { grey, lime } from '@mui/material/colors';
import { DataGrid } from '@mui/x-data-grid';

import { useCommentDB } from '../context/commentDBContext';
import { useTaskDB } from '../context/taskDBContext.jsx';
import { useStateDB } from '../context/stateDBContext.jsx';
import { useProjectDB } from '../context/projectDBContext.jsx';
import { useWorkSpaceDB } from '../context/workspaceDBContext.jsx';
import { useUserDB } from '../context/userDBContext.jsx';

const collectionCAT = {
    0 : "Comment",
    1 : "Task",
    2 : "State",
    3 : "Project",
    4 : "WorkSpace",
    5 : "User"
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

    const [checkedFollowExpireDate, setCheckedFollowExpireDate] = useState(true);

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

    const handleCheckBoxChange = (e)=>{
        setCheckedFollowExpireDate(e.target.checked);
    }

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
            case 5:
                collectionRef = userCollectionRef;
                break;
            case 4:
                collectionRef = workSpaceCollectionRef;
                break;
            case 3:
                collectionRef = projectCollectionRef;
                break;
            case 2:
                collectionRef = projectStateCollectionRef;
                break;
            case 1:
                collectionRef = taskCollectionRef;
                break;
            case 0:
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

    const removeAction = async({selectionIdx, refList, docList})=>{

        let promises = null;

        const now = new Date();

       switch (selectionIdx)
        {
            // all expired User Doc and remove
            case 5:
                 promises = docList.map(async (doc, index)=> {

                    if (!checkedFollowExpireDate ||
                        now > doc.expiredAt.toDate())
                    {
                        const ref = refList[index];
                        
                        await removeUserByRefAndDocData({userRef : ref, userDocData : doc});
                    }
                })
                break;

            // all expired WorkSpace Doc and remove
            case 4:
                promises = docList.map(async (doc, index)=> {

                    if (!checkedFollowExpireDate ||
                        now > doc.expiredAt.toDate())
                    {
                        const ref = refList[index];

                        await removeWorkSpaceByRefAndDocData({workSpaceRef : ref, workSpaceDocData : doc});
                    }
                })
                break;

            // all expired Project Doc and remove
            case 3:
                promises = docList.map(async (doc, index)=> {

                    if (!checkedFollowExpireDate ||
                        now > doc.expiredAt.toDate())
                    {
                        const ref = refList[index];

                        await removeProjectByRefAndDocData({projectRef : ref, projectDocData : doc});
                    }
                })
                break;

            // all expired State Doc and remove
            case 2:
                promises = docList.map(async (doc, index)=> {

                    if (!checkedFollowExpireDate ||
                        now > doc.expiredAt.toDate())
                    {
                        const ref = refList[index];

                        await removeStateByRefAndDocData({stateRef : ref, stateDocData : doc});
                    }
                })
                break;

            // all expired Task Doc and remove
            case 1:
                promises = docList.map(async (doc, index)=> {

                    if (!checkedFollowExpireDate ||
                        now > doc.expiredAt.toDate())
                    {
                        const ref = refList[index];

                        await removeTaskByRefAndDocData({taskRef : ref, taskDocData : doc});
                    }
                })
                break;

            // All expired User Doc and remove
            case 0:
                promises = docList.map(async (doc)=> {

                    if (!checkedFollowExpireDate ||
                        now > doc.expiredAt.toDate())
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
        }
    }

    const handleRemove = async (e)=>{

        e.preventDefault();

        await removeAction({selectionIdx : Number(selection),
                            refList : collectionResult.ref,
                            docList : collectionResult.doc
        });
        
        // update the table
        handleSearch(selection);  
    }

    const handleRemoveAll = async (e)=>{

        e.preventDefault();

        for (let keyIdx in Object.keys(collectionCAT))
        {
            let collectionRef = null;

            const index = Number(keyIdx);

            switch (index)
            {
                case 5:
                    collectionRef = userCollectionRef;
                    break;
                case 4:
                    collectionRef = workSpaceCollectionRef;
                    break;
                case 3:
                    collectionRef = projectCollectionRef;
                    break;
                case 2:
                    collectionRef = projectStateCollectionRef;
                    break;
                case 1:
                    collectionRef = taskCollectionRef;
                    break;
                case 0:
                    collectionRef = commentCollectionRef;
                    break;
                default:
                    break;
            }

            if (collectionRef)
            {
                const {docRefList, docObjList} = await getCollectionDocByRefAndMatchFieldWithComparatorStr(collectionRef, "!=", "expiredAt", null);

                await removeAction({selectionIdx : index,
                                    refList : docRefList,
                                    docList : docObjList
                                    });
            }
        }

        // update the table
        handleSearch(selection); 
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
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '2rem'
                            }}>
                                <Button 
                                    variant='contained'
                                    color="secondary"
                                    onClick={handleRemove}
                                >
                                    Remove
                                </Button>

                                <Button 
                                    variant='contained'
                                    onClick={handleRemoveAll}

                                    sx={{
                                        backgroundColor: lime[800]
                                    }}
                                >
                                    Remove All
                                </Button>

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checkedFollowExpireDate}
                                            onChange={handleCheckBoxChange}
                                        />
                                    }
                                    label="Follow Expire Date To Remove"
                                />

                            </div>
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