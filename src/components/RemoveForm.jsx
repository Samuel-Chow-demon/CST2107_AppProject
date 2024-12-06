import { Box, Button, TextField, Typography } from '@mui/material';
import {useEffect, memo, useCallback} from 'react'
import useInputForm from '../hooks/useInputForm';
import { grey, red } from '@mui/material/colors';

const RemoveForm = ({removeFromDB, categoryName, targetName, setOpenDialog})=>{

    const removeTargetForm = {
        'inputTargetName' : "",
      }

    const {
        formData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setOtherRegisterFieldErrChk,
        validateInput } = useInputForm(removeTargetForm);

    useEffect(()=>{

            setOtherRegisterFieldErrChk([
                {'field' : 'inputTargetName', 'condition' : (inputFormData)=>inputFormData.inputTargetName === targetName, 'errMsg' : `${categoryName} Name Not Matched`}
            ])
      
          }, [])

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const proceedRemoveWorkSpace = ()=>{

        if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
        {
            setDisableInput(true)
  
            removeFromDB();
  
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
                label={`Enter ${categoryName} Name To Remove`}
                value={value}
                placeholder={`${categoryName} Name : [${targetName}]`}
                size='Normal'
                onChange={onChange}
            />
          );
      });

      const RemoveFormComponents = memo(()=>(
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
                    error={formInputErrors['inputTargetName'].isError}
                    helperText={formInputErrors['inputTargetName'].message}
                    value={formData['inputTargetName']}
                    onChange={handleInputChange('inputTargetName')}
                />
            </>
        ));

      const RemoveActionComponent = memo(()=>(

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
                <RemoveFormComponents />
                <RemoveActionComponent />
            </>);
}

export default memo(RemoveForm)