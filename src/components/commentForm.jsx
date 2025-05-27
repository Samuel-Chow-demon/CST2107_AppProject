import { Box, Button, TextField } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { memo, useCallback, useEffect } from 'react';
import { useCommentDB } from '../context/commentDBContext';
import useInputForm from '../hooks/useInputForm';

const CommentForm = ({taskID, userUID, setFormOpen, currentCommentForm={}, parentCommentForm={}})=>{

    const {
        createComment, editComment
    } = useCommentDB();

    const isEditMode = Object.keys(currentCommentForm).length > 0;

    const createCommentForm = {
        comment : "",
        userUID : userUID,
        replyIDs : [],
        taskID : taskID
    }

    const {
        formData, setFormData,
        enterInput, isDisableInput, setDisableInput,
        formInputErrors,
        setOtherRegisterFieldErrChk,
        validateInput } = useInputForm(isEditMode ? currentCommentForm : createCommentForm);

    useEffect(()=>{

        setOtherRegisterFieldErrChk([
            {'field' : 'comment', 'condition' : (inputFormData)=>inputFormData.comment.length > 0, 'errMsg' : `Comment Is Empty`}
        ])
    
    }, [])

    const handleInputChange = useCallback((field)=>(e) => enterInput(field)(e), [enterInput]);

    const proceedActionComment = async()=>{

        // If the name ever changed in edit mode
        if (isEditMode &&
            currentCommentForm.comment === formData.comment)
        {
            setFormOpen(false)
            return;
        }
        
        if (validateInput({byPassPasswordCheck:true, byPassPasswordConfirm :true}))
        {
            setDisableInput(true)
            //setTaskIsLoading(true)
            setFormOpen(false)
    
            isEditMode?
            await editComment({formData:formData, commentID:currentCommentForm.id}) : 
            await createComment({formData:formData, parentCommentID: Object.keys(parentCommentForm).length > 0 ? parentCommentForm.id : ""});
    
            setDisableInput(false)
            //setTaskIsLoading(false)
        }
        
    }

    const CommentFormComponents = memo(() => (
        <>
            <TextField
                fullWidth
                autoFocus
                required
                disabled={isDisableInput}
                sx={{
                    opacity: isDisableInput ? 0.5 : 1,
                }}
                error={formInputErrors['comment'].isError}
                helperText={formInputErrors['comment'].message}
                label={`Comment`}
                value={formData['comment']}
                placeholder="Your Comments or Reply"
                size='Normal'
                onChange={handleInputChange('comment')}
            />
        </>
    ));

    const CommentActionComponent = memo(()=>(

        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'none', padding:'2px', gap:2}}>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:blue[300]
                    }
                }} 
                onClick={proceedActionComment}>{isEditMode ? 'Edit' : 'Post'}</Button>
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
            <div style={{width:'100%',
                        display:'flex',
                        flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center',
                        padding:'0'}}>
                <CommentFormComponents />
                <CommentActionComponent />
            </div>
        );
}

export default memo(CommentForm)