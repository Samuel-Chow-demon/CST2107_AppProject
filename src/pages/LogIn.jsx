import { useContext, useState } from 'react';
import {useNavigate} from 'react-router-dom';

import {//createTheme, ThemeProvider,
        Paper, Typography, Avatar, Button } from '@mui/material';

import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

import { validateAccountSetupInput } from '../components/utility.js';
import {InputEmailBox, InputPasswordBox, passwordBoxIcon} from '../components/Input.jsx';

import {CONST_PATH, CONST_LOG_IN_DELAY_MS} from '../components/front_end_constant.js';

import './Login.css';
import { DisplayMessage } from '../components/display.jsx';

import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getErrorCode } from '../fireStore/error.js';

import userContext from '../context/userContext.js'


const LogInform = ({clickHandleToSignUp}) => {

    const navigate = useNavigate();

    // ********************************************** Declare useState Variable
    const initFormData = {
        email : '',
        password : '',
        username : 'login'
    }

    const [formData, setFormData] = useState(initFormData);

    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const [isDisableLogin, setDisableLogin] = useState(false);

    const [showSpinner, setShowSpinner] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [okMessage, setOkMessage] = useState('');

    const {_currentUser, setCurrentUser} = useContext(userContext);

    // ********************************************** Declare useState Variable



    // ********************************************** Declare function
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const enterEmail = (event)=>{

        setEmailError(false);
        setEmailErrorMessage('');

        setFormData({
            ...formData,
            email: event.target.value
        })
    };

    const enterPassword = (event)=>{

        setPasswordError(false);
        setPasswordErrorMessage('');

        setFormData({
            ...formData,
            password: event.target.value
        })
    };

    const hideMessageDisplay = () =>{
        setShowSpinner(false);
        setErrorMessage('');
        setOkMessage('');
    }

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

    const FORM_ITEM_TAILWIND_STYLE = `mt-5 w-full`;

    // ********************************************** Create Function
    function validateInput () 
    {
        const funcInit = () => {

            setEmailError(false);
            setEmailErrorMessage('');

            setPasswordError(false);
            setPasswordErrorMessage('');
        };

        const funcErrorHandle = (emailError, passwordError) => {

            if (emailError.length > 0)
            {
                setEmailError(true);
                setEmailErrorMessage(emailError);
            }
    
            if (passwordError.length > 0)
            {
                setPasswordError(true);
                setPasswordErrorMessage(passwordError);
            }
        };
    
        return validateAccountSetupInput(formData, funcInit, funcErrorHandle);
    }

    const clickSubmit = async (event)=>{

        setDisableLogin(true);

        if (validateInput())
        {
            try {

                // 1 - Check FireBase Authentication
                const { user } = await signInWithEmailAndPassword(auth, formData.email, formData.password);

                await user.reload();

                const accesstoken = await user.getIdToken(); // Retrieve the access token

                if (!user.displayName)
                {
                    user.displayName = auth.currentUser.displayName;
                }

                console.log(user);

                // No need to use backend to get the token, firebase already had token access
                // 2 - After pass the credential, get the Token generated from the backend by API
                // const logintoken = await fetch(`${SERVER_URL}${API_USER_URL}/login/token`, {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     body: JSON.stringify({
                //         name : user.displayName,
                //         email : user.email,
                //         id : user.uid
                //     })
                // })
                //const logintokenJSON = await logintoken.json();
                //const loginData = logintokenJSON.data;

                // Here Display Log In Success / Error Component
                hideMessageDisplay();
                setOkMessage("User Logged In Successfully");

                // Wait for the next browser repaint using requestAnimationFrame
                await new Promise(resolve => requestAnimationFrame(resolve));
    
                // Store user info include id and token to local Storage
                setCurrentUser({
                    userName : user.displayName,
                    email : user.email,
                    uid : user.uid,
                    token : accesstoken
                });

                // Set a Timeout then jump to the Home Page
                setTimeout(()=>{
                    // Direct to Home Page
                    navigate(CONST_PATH.home); // '/home'

                }, CONST_LOG_IN_DELAY_MS);               
            }
            catch(error){
        
                //alert(`Error : ${error}`);

                // Here display the LogIn Fail Component
                hideMessageDisplay();
                const errMessage = getErrorCode(error.code);
                setErrorMessage(`Login User ${formData.email} Fail (${errMessage})`);

                // remove the whatever if any fail
                setCurrentUser(null);
            }

            // Whatever, reset the form data
            setFormData(initFormData);
        }
        setDisableLogin(false);
    };

    return (
        <div className="flex justify-center">
            {/* <ThemeProvider theme={theme}> */}
                <Paper elevation={10} id="id-card-login" className="flex justify-center aligns-center py-20">
                    <div className="flex flex-col items-center w-96">
                        <Avatar className="my-10" id="id-icon-bkgrd-login"><VpnKeyIcon id="id-icon-login" /></Avatar>

                        <div className="mt-1 mb-8 flex flex-col items-center">
                            <Typography component={'span'} variant='h4'>Welcome To</Typography>
                            <Typography component={'span'} variant='h4' id='id-app-name'>SimpleWork</Typography>
                        </div>

                        <DisplayMessage
                            showSpinner = {showSpinner}
                            errorMsg = {errorMessageControl}
                            okMsg={okMessageControl}
                        />

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputEmailBox
                                disabled={isDisableLogin}
                                emailValue = {formData.email}
                                enterEmailCallBk = {enterEmail}
                                isEmailError = {emailError}
                                emailErrorMessage = {emailErrorMessage}
                            />
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputPasswordBox
                                disabled={isDisableLogin}
                                sx={{
                                    opacity: isDisableLogin ? 0.5 : 1,
                                }}
                                password = {formData.password}
                                iconType = {passwordBoxIcon.showButton}
                                showPassword = {showPassword}
                                isPasswordError = {passwordError}
                                passwordErrorMessage = {passwordErrorMessage}
                                enterPasswordCallBk = {enterPassword}
                                handleClickShowPassword = {handleClickShowPassword}
                            />
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <Button 
                                fullWidth
                                disabled={isDisableLogin}
                                id="id-button-login"
                                variant="contained" 
                                onClick={clickSubmit}>
                                    Log In
                            </Button>
                        </div>

                        <div className= "mt-10 w-full flex justify-center">
                            <Typography component={'span'} variant='h8'>Not Yet Have An Account ? <a className="underline font-bold" href='#' onClick={clickHandleToSignUp}>Sign Up</a></Typography>
                        </div>
                    </div>

                </Paper>
            {/* </ThemeProvider> */}
        </div>
    )
}

export default LogInform