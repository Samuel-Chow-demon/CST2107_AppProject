import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import {useEffect, memo, useCallback} from 'react'
import useInputForm from '../hooks/useInputForm';
import { blue, grey, red } from '@mui/material/colors';
import { useStateDB } from '../context/stateDBContext';

const StateForm_V2 = ({projectID, setFormOpen, currentStateForm={}})=>{

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

        // If the name ever changed in edit mode
        if (!isEditMode ||
            currentStateForm.name !== formData.name)
        {
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
    }

    const StateFormComponents = memo(() => (
        <>
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
                onBlur={proceedActionState}
            />
        </>
    ));

    return (
            <div style={{width:'100%',
                        display:'flex',
                        flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        padding:'0'}}>
                <StateFormComponents />
            </div>
        );
}

export default memo(StateForm_V2)