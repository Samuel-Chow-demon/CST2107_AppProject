import { Box, Button, Paper, TextField } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { memo, useCallback, useEffect } from 'react';
import { useStateDB } from '../context/stateDBContext';
import useInputForm from '../hooks/useInputForm';

const StateForm = ({projectID, setFormOpen, currentStateForm={}})=>{

    const {
        setStateIsLoading,
        createState, editState
    } = useStateDB();

    const isEditMode = Object.keys(currentStateForm).length > 0;

    const createStateForm = {
        name : "",
        taskIDs : [],
        projectID : projectID
    }

    const {
        formData, setFormData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setOtherRegisterFieldErrChk,
        validateInput } = useInputForm(isEditMode ? currentStateForm : createStateForm);

    useEffect(()=>{

        setOtherRegisterFieldErrChk([
            {'field' : 'name', 'condition' : (inputFormData)=>inputFormData.name.length > 0, 'errMsg' : `State Name Cannot Be Empty`}
        ])
    
    }, [])

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const proceedActionState = async()=>{

        if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
        {
            setDisableInput(true)
            //setStateIsLoading(true)
            setFormOpen(false)
  
            isEditMode?
            await editState({formData:formData, stateID:currentStateForm.id}) : await createState({formData:formData});
  
            setDisableInput(false)
            setStateIsLoading(false)
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
                label={`State Name`}
                value={value}
                // placeholder=""
                size='Normal'
                onChange={onChange}
            />
        );
    });

    const StateFormComponents = memo(() => (
        <>
            {/* <MemoizedTextField
                fullWidth
                required
                disabled={isDisableInput}
                error={formInputErrors['name'].isError}
                helperText={formInputErrors['name'].message}
                value={formData['name']}
                onChange={handleInputChange['name']}
            /> */}

            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['name'].isError}
                helperText={formInputErrors['name'].message}
                label={`State Name`}
                value={formData['name']}
                // placeholder=""
                size='Normal'
                onChange={handleInputChange('name')}
            />
        </>
    ));

    const StateActionComponent = memo(()=>(

        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', padding:'2px', gap:2}}>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:blue[300]
                    }
                }} 
                onClick={proceedActionState}>{isEditMode ? 'Edit' : 'Create'}</Button>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:grey[600]
                    }
                }}
                onClick={()=>setFormOpen(false)}>
                Cancel
            </Button>
        </Box>
    ));

    return (
        <Paper style={{
            height: 'auto',
            width:'15rem',
            display: 'flex',
            flexDirection: 'column', gap: '20px',
            justifyContent: 'center', alignItems: 'center'
        }}
            elevation={0}>
            <div style={{width:'100%', display:'flex', flexDirection: 'column', gap:'16px', padding:'10px'}}>
                <StateFormComponents />
                <StateActionComponent />
            </div>
        </Paper>
        );
}

export default memo(StateForm)