import React, { useCallback, useState } from 'react'
import { DisplayMessage } from '../components/display.jsx';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

const useDisplayMessage = () => {

  const [showSpinner, setShowSpinner] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [okMessage, setOkMessage] = useState('');

  const errorMessageControl = {
    message : errorMessage,
    color: 'rgb(224, 124, 111)',
    icon : <CancelIcon style={{color:'rgb(224, 124, 111)', fontSize:'36px'}}/>
  }

  const okMessageControl = {
      message : okMessage,
      color: 'rgb(81, 155, 72)',
      icon : <DoneOutlineIcon style={{color:'rgb(81, 155, 72)', fontSize:'36px'}}/>
  }

  const setDisplaySpinner = useCallback((show)=>{
    setShowSpinner(show);
  }, [setShowSpinner, setErrorMessage, setOkMessage]);

  const setDisplayErrorMsg = useCallback((msg)=>{
    setErrorMessage(msg);
    setOkMessage('');
    setShowSpinner(false);
  }, [setShowSpinner, setErrorMessage, setOkMessage]);

  const setDisplayOKMsg = useCallback((msg)=>{
    setErrorMessage('');
    setOkMessage(msg);
    setShowSpinner(false);
  }, [setShowSpinner, setErrorMessage, setOkMessage]);

  const hideDisplay = useCallback(()=>{
    setErrorMessage('');
    setOkMessage('');
    setShowSpinner(false);
  }, [setShowSpinner, setErrorMessage, setOkMessage]); 

  const DisplayMessageComponent = ()=>{
    return (
      <>
        <DisplayMessage 
          showSpinner = {showSpinner}
          errorMsg = {errorMessageControl}
          okMsg = {okMessageControl}
        />
      </>
    );
  }


  return {
    setDisplaySpinner,
    hideDisplay, setDisplayOKMsg,
    setDisplayErrorMsg,
    DisplayMessageComponent
  };
}

export default useDisplayMessage