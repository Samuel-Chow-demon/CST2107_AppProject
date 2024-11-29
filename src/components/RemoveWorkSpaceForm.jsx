import { Box, Button, TextField, Typography } from '@mui/material';
import {useEffect, memo, useCallback} from 'react'
import useInputForm from '../hooks/useInputForm';
import { grey, red } from '@mui/material/colors';

const RemoveWorkSpaceForm = ({removeWorkSpaceDB, workspaceName, setOpenDialog, workspaceID, creatorUID})=>{

    const removeWorkSpaceForm = {
        'inputWorkSpaceName' : "",
      }

    const {
        formData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setOtherRegisterFieldErrChk,
        validateInput } = useInputForm(removeWorkSpaceForm);

    useEffect(()=>{

            setOtherRegisterFieldErrChk([
                {'field' : 'inputWorkSpaceName', 'condition' : (inputFormData)=>inputFormData.inputWorkSpaceName === workspaceName, 'errMsg' : 'Workspace Name Not Matched'}
            ])
      
          }, [])

    const handleNameChange = useCallback((e) => enterInput('inputWorkSpaceName')(e), [enterInput]);

    const proceedRemoveWorkSpace = ()=>{

        if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
        {
            setDisableInput(true)
  
            removeWorkSpaceDB({workspaceID:workspaceID, userUID:creatorUID});
  
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
                label="Enter Workspace Name To Remove"
                value={value}
                placeholder={`Workspace Name : [${workspaceName}]`}
                size='Normal'
                onChange={onChange}
            />
          );
      });

      const WorkSpaceFormComponents = memo(()=>(
            <>
                <Typography sx={{
                    color: red[800],
                    fontSize: '24px',
                    textAlign: 'center',
                    whiteSpace: 'pre-line'
                }}>Sure To Remove ?{'\n'} All The Content Will Be Removed Permanently.</Typography>
                <MemoizedTextField
                    fullWidth
                    required
                    disabled={isDisableInput}
                    error={formInputErrors['inputWorkSpaceName'].isError}
                    helperText={formInputErrors['inputWorkSpaceName'].message}
                    value={formData['inputWorkSpaceName']}
                    onChange={handleNameChange}
                />
            </>
        ));

      const WorkSpaceActionComponent = memo(()=>(

            <Box sx={{display:'flex', justifyContent:'space-around', alignItems:'center', border:'none', gap:2}}>
                <Button sx={{
                        '&:hover':{
                            color:grey[100],
                            backgroundColor:red[300]
                        }
                    }} 
                    onClick={proceedRemoveWorkSpace}>Remove</Button>
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

    return (<>
                <WorkSpaceFormComponents />
                <WorkSpaceActionComponent />
            </>);
}

export default memo(RemoveWorkSpaceForm)