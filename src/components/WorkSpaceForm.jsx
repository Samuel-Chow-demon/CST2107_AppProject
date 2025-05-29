import { Box, Button, Chip, CircularProgress, Divider, TextField, Typography } from '@mui/material';
import {useEffect, memo, useContext, useCallback, useMemo, useState} from 'react'
import { useColorPicker } from '../hooks/useColorPicker';
import userContext from '../context/userContext';
import useInputForm from '../hooks/useInputForm';
import { blue, grey } from '@mui/material/colors';
import { usePicturePicker } from '../hooks/usePicturePicker';
import { useWorkSpaceDB } from '../context/workspaceDBContext';
import { useUserDB } from '../context/userDBContext';

const WorkSpaceForm = ({setOpenDialog, currentWSForm = {}})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const {
        setWSIsLoading,
        createWorkSpace, editWorkSpace } = useWorkSpaceDB();

    const isEditMode = Object.keys(currentWSForm).length > 0;

    const { alertUserDB, setAlertUserDB, getUserDocData } = useUserDB();
    const [allUserInWorkSpaceDoc, setAllUserInWorkSpaceDoc] = useState([]);
    const [isLoadedAllUser, setLoadedAllUser] = useState(false);

    const {color, ColorPicker} = useColorPicker("Background Color", isEditMode ? currentWSForm.bkgrdColor : "");
    const { selectedPicture, PicturePicker } = usePicturePicker(isEditMode ? currentWSForm.img : "");

    const createWorkSpaceForm = {
        name : "",
        bkgrdColor : "",
        creatorUID : _currentUser.uid,
        userUIDs : [_currentUser.uid],
        img : ""
      }

    const {
        formData, setFormData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setOtherRegisterFieldErrChk,
        validateInput } = useInputForm(isEditMode ? currentWSForm : createWorkSpaceForm);

    useEffect(() => {
        setAlertUserDB({ ...alertUserDB, message: '', isOpen: false });
    }, [])

    useEffect(() => {

        if (isEditMode)
        {
            const getWorkSpaceUserDoc = async () => {
                setAllUserInWorkSpaceDoc(await getUserDocData(currentWSForm.userUIDs));
                setLoadedAllUser(true);
            }
    
            getWorkSpaceUserDoc();
        }
        else
        {
            setLoadedAllUser(true);
        }

    }, [currentWSForm])

    useEffect(()=>{

            setOtherRegisterFieldErrChk([
                {'field' : 'name', 'condition' : (inputFormData)=>inputFormData.name.length > 0, 'errMsg' : 'Workspace Name Cannot Be Empty'}
            ])
      
          }, [])

    useEffect(()=>{

            enterInput('bkgrdColor', color)();
            
          }, [color])

    useEffect(()=>{

            enterInput('img', selectedPicture)();
            
          }, [selectedPicture])

    // useEffect(()=>{

    //         console.log("updated Color", formData['bkgrdColor']);
          
    //       }, [formData.bkgrdColor])

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const proceedActionProject = async()=>{

        if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
        {
            setDisableInput(true)
            setWSIsLoading(true)
            setOpenDialog(false)
  
            isEditMode?
            await editWorkSpace({formData:formData, workspaceID:currentWSForm.id}) : await createWorkSpace({formData:formData});
  
            setDisableInput(false)
            setWSIsLoading(false)
        }
    }

    const MemoizedTextField = memo(({ value, onChange, error, helperText, disabled }) => {
        return (
            <TextField
                fullWidth
                autoFocus
                required
                disabled={disabled}
                sx={{
                    opacity: disabled ? 0.5 : 1,
                }}
                error={error}
                helperText={helperText}
                label="Workspace Name"
                value={value}
                placeholder='workspace'
                size='Normal'
                onChange={onChange}
            />
          );
      });

      const handleDeleteAddedUser = (userUid)=>{

        setFormData((prev)=>({
          ...prev,
          userUIDs : prev.userUIDs.filter((uid, idx)=>uid !== userUid)
        }));
      }

      const DisplayAddedUserComponent = ()=>{
        return (

              <Box sx={{ display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-around',
                        padding: 2,
                        alignItems: 'left', border: allUserInWorkSpaceDoc.length > 0 ? '1px solid' : 'none',
                        borderColor:grey[500], gap: 2,
                        borderRadius:'4px' }}>
    
              {
                  (isLoadedAllUser && allUserInWorkSpaceDoc.length > 0) ?
                  allUserInWorkSpaceDoc
                    .filter((user)=>formData['userUIDs'].includes(user.uid))
                    .map((user, index)=>(
    
                      <Chip key={index} label={user.email} variant="outlined" 
                            onDelete={(user.uid != _currentUser.uid && user.uid != formData['creatorUID']) ? ()=>handleDeleteAddedUser(user.uid) : undefined} />
                  ))
                  :
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '5px'
                    }}>
                        <CircularProgress sx={{ size: 10 }} />
                    </Box>
              }
              </Box>
    
              
        );
    }

      const WorkSpaceFormComponents = memo(()=>(
            <>
                <ColorPicker />
                <MemoizedTextField
                    fullWidth
                    required
                    disabled={isDisableInput}
                    error={formInputErrors['name'].isError}
                    helperText={formInputErrors['name'].message}
                    value={formData['name']}
                    onChange={handleInputChange('name')}
                />
                <Box sx={{display: 'flex', justifyContent:'center', alignItems:'center'}}>
                    <Box
                        sx={{display: 'grid', gridTemplateColumns: '5rem 10rem', gap:2}}> 
                        <Typography sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>Image :</Typography>
                        <PicturePicker />
                    </Box>
                </Box>
                {
                    isEditMode &&
                    <DisplayAddedUserComponent />
                }
            </>
        ));

      const WorkSpaceActionComponent = memo(()=>(

            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', padding:'2px', gap:2}}>
                <Button sx={{
                        '&:hover':{
                            color:grey[100],
                            backgroundColor:blue[300]
                        }
                    }} 
                    onClick={proceedActionProject}>{isEditMode ? 'Edit' : 'Create'}</Button>
                <Button sx={{
                        '&:hover':{
                            color:grey[100],
                            backgroundColor:grey[600]
                        }
                    }}
                    onClick={()=>setOpenDialog(false)}>
                    Cancel
                </Button>
            </Box>
        ));

    return (<div style={{width:'100%', display:'flex', flexDirection: 'column', gap:'16px'}}>
                <WorkSpaceFormComponents />
                <WorkSpaceActionComponent />
            </div>);
}

export default memo(WorkSpaceForm)