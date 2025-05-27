
import {
    CircularProgress,
    Typography
} from '@mui/material';

const DisplayMessage = ({showSpinner = false, errorMsg = {message:'', color:'red', icon:null},
                         okMsg = {message:'', color:'green', icon:null}}) => {

    const errorMsgStyle = {
        color: `${errorMsg.color}`,
    }
    
    const okMsgStyle = {
        color: `${okMsg.color}`,
    } 
    
    return (
        <>
            {(showSpinner || errorMsg?.message.length > 0 || okMsg?.message.length > 0) && 
                (
                    <div className="mt-1 mb-5 flex flex-col items-center w-full">
                        {showSpinner && <CircularProgress />}

                        {errorMsg.message.length > 0 &&
                            (
                                <div className="grid grid-cols-5 gap-2 w-full">
                                    <Typography className="col-span-5 md:col-span-4 px-2 break-words whitespace-normal"
                                                style={errorMsgStyle} variant='h6'>{errorMsg.message}</Typography>
                                    {errorMsg.icon && 
                                        (
                                            <div className="md:col-span-1 flex items-center justify-center">
                                                {errorMsg.icon}
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }

                        {okMsg.message.length > 0 &&
                            (
                                <div className="grid grid-cols-5 gap-2 w-full">
                                    <Typography className="col-span-5 md:col-span-4 px-2 break-words whitespace-normal"
                                                style={okMsgStyle} variant='h6'>{okMsg.message}</Typography>
                                    {okMsg.icon && 
                                        (
                                            <div className="md:col-span-1 flex items-center justify-center">
                                                {okMsg.icon}
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                )
            }      
        </>
    )
};

export { DisplayMessage };
