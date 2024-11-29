import { Box, Button, Divider, TextField, Typography } from '@mui/material';
import {useEffect, memo, useContext, useCallback, useMemo} from 'react'
import { useColorPicker } from '../hooks/useColorPicker';
import userContext from '../context/userContext';
import useInputForm from '../hooks/useInputForm';
import { blue, grey } from '@mui/material/colors';
import { usePicturePicker } from '../hooks/usePicturePicker';

const CreateWorkSpaceForm = ({createWorkSpaceDB, setOpenDialog})=>{

    const {_currentUser, setCurrentUser} = useContext(userContext);

    const {color, ColorPicker} = useColorPicker("Background Color");
    const { selectedPicture, PicturePicker } = usePicturePicker();

    const createWorkSpaceForm = {
        'name' : "",
        'bkgrdColor' : "",
        'creatorUID' : _currentUser.uid,
        'img' : ""
      }

    const {
        formData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setOtherRegisterFieldErrChk,
        validateInput } = useInputForm(createWorkSpaceForm);

    useEffect(()=>{

            setOtherRegisterFieldErrChk([
                {'field' : 'name', 'condition' : (inputFormData)=>inputFormData.name.length > 0, 'errMsg' : 'Workspace Name Cannot Empty'}
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

    const handleNameChange = useCallback((e) => enterInput('name')(e), [enterInput]);

    const proceedCreateWorkSpace = ()=>{

        if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
        {
            setDisableInput(true)
  
            createWorkSpaceDB({name:formData['name'], bkgrdColor:formData['bkgrdColor'],
                               Img:formData['img'], creatorUID:formData['creatorUID']});
  
            setDisableInput(false)
            setOpenDialog(false)
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

      const WorkSpaceFormComponents = memo(()=>(
            <>
                <MemoizedTextField
                    fullWidth
                    required
                    disabled={isDisableInput}
                    error={formInputErrors['name'].isError}
                    helperText={formInputErrors['name'].message}
                    value={formData['name']}
                    onChange={handleNameChange}
                />
                <ColorPicker />
                <Box
                    sx={{display: 'grid', gridTemplateColumns: '5rem 10rem', gap:2}}> 
                    <Typography sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>Image :</Typography>
                    <PicturePicker />
                </Box>
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
                    onClick={proceedCreateWorkSpace}>Create</Button>
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

export default memo(CreateWorkSpaceForm)