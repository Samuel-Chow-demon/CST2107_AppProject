import { Box, Button, TextField, Typography } from '@mui/material';
import {useEffect, memo, useCallback} from 'react'
import useInputForm from '../hooks/useInputForm';
import { grey, red } from '@mui/material/colors';

const RemoveCommentForm = ({removeFromDB, commentStr, setOpenDialog})=>{

    const proceedRemove = ()=>{

        removeFromDB();
        setOpenDialog(false) 
    }

    const RemoveFormComponents = memo(()=>(
        <>
            <Typography sx={{
                color: red[800],
                fontSize: '24px',
                textAlign: 'center',
                whiteSpace: 'pre-line'
            }}>Sure To Remove ?{'\n'} {commentStr}</Typography>
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
                onClick={proceedRemove}>Remove</Button>
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

export default memo(RemoveCommentForm)