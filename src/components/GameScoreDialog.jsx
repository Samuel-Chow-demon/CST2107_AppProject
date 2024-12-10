import { Box, Button, TextField, Typography } from '@mui/material';
import {useEffect, memo, useCallback} from 'react'
import { blue, grey, red } from '@mui/material/colors';

const GameScoreDialog = ({message, setOpenDialog})=>{

    const proceedOK = ()=>{
        setOpenDialog(false) 
    }

    const MessageComponents = memo(()=>(
        
        <>
            <Typography sx={{
                color: blue[800],
                fontSize: '24px',
                textAlign: 'center',
                whiteSpace: 'pre-line'
            }}>{`${message}`}
            </Typography>
        </>
        
    ));

    const ActionComponent = memo(()=>(

        <Box sx={{display:'flex', justifyContent:'space-around', alignItems:'center', border:'none', gap:2}}>
            <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:blue[400]
                    }
                }} 
                onClick={proceedOK}>Close</Button>
            {/* <Button sx={{
                    '&:hover':{
                        color:grey[100],
                        backgroundColor:grey[600]
                    }
                }}
                onClick={()=>setOpenDialog(false)}>
                Cancel
            </Button> */}
        </Box>
    ));

    return (<>
                <MessageComponents />
                <ActionComponent />
            </>);
}

export default memo(GameScoreDialog)