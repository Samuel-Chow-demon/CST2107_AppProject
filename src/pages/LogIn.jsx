import { memo, useContext, useState } from 'react';
import {useNavigate} from 'react-router-dom';

import {//createTheme, ThemeProvider,
        Paper, Typography, Avatar, Button } from '@mui/material';

import VpnKeyIcon from '@mui/icons-material/VpnKey';

import {InputEmailBox, InputPasswordBox, passwordBoxIcon} from '../components/Input.jsx';

import {CONST_PATH, CONST_LOG_IN_DELAY_MS} from '../components/front_end_constant.js';

import './LogIn.css';

import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getErrorCode } from '../fireStore/error.js';

import userContext from '../context/userContext.js'
import useInputForm from '../hooks/useInputForm.js'
import useDisplayMessage from '../hooks/useDisplayMessage.jsx';
import { useUserDB } from '../context/userDBContext.jsx';
import { grey } from '@mui/material/colors';


const LogInform = ({clickHandleToSignUp}) => {

    const navigate = useNavigate();

    const initFormData = {
        email : '',
        password : '',
        username : 'login'
    }

    // Use the form data hooks
    const {
        formData, resetFormData,
        enterInput,
        showPassword, handleClickShowPassword,
        isDisableInput, setDisableInput,
        formInputErrors,
        validateInput
    } = useInputForm(initFormData);

    const {
        setDisplaySpinner,
        setDisplayOKMsg,
        setDisplayErrorMsg,
        DisplayMessageComponent
      } = useDisplayMessage();

    const {setCurrentUser} = useContext(userContext);

    const { setUserDBUpdate, updateUserDB } = useUserDB()

    const [toGuestLogIn, setToGuestLogIn] = useState(false);

    // ********************************************** Create Function
   
    const clickSubmit = async (event)=>{

        setDisplaySpinner(true);
        setDisableInput(true);

        if (validateInput({byPassPasswordConfirm : true}))
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

                //console.log(user);

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
                setDisplayOKMsg("User Logged In Successfully");

                // Wait for the next browser repaint using requestAnimationFrame
                //await new Promise(resolve => requestAnimationFrame(resolve));

                // Upate the UserDB to Logged In status
                await updateUserDB({uid:user.uid, groupObjValue:{
                    loggedIn : true
                }});

                // Store user info include id and token to local Storage
                setCurrentUser({
                    userName : user.displayName,
                    email : user.email,
                    uid : user.uid,
                    token : accesstoken,
                    loggedIn : true,
                    isUpdating : false
                });

                // Toggle to trigger userDBContext to update the user DB and check the Workspace DB
                setUserDBUpdate(prevValue=>!prevValue);

                // Set a Timeout then jump to the Home Page
                setTimeout(()=>{
                    // Direct to Home Page
                    navigate(CONST_PATH.home); // '/home'

                }, CONST_LOG_IN_DELAY_MS);               
            }
            catch(error){
        
                //alert(`Error : ${error}`);

                // Here display the LogIn Fail Component
                const errMessage = getErrorCode(error.code);
                setDisplayErrorMsg(`Login User ${formData.email} Fail (${errMessage})`);

                // remove the whatever if any fail
                setCurrentUser(null);
            }

            // Whatever, reset the form data
            resetFormData();
        }
        console.log('NG');
        setDisableInput(false);
        setDisplaySpinner(false);
    };

    const clickGuestLogIn = (event)=>{

        setDisplaySpinner(true);
        setDisableInput(true);

        try
        {
            const UUID = crypto.randomUUID();
            const date = new Date();
            const timestamp = date.getTime();

            // Store user info include id and token to local Storage
            setCurrentUser({
                userName : `Guest`,
                email : `${UUID}@guest.com`,
                uid : `guest-${UUID}`,
                token : timestamp.toString(),
                isGuest: true,
                loggedIn : true,
                isUpdating : false
            });

            // Toggle to trigger userDBContext to update the user DB and check the Workspace DB
            setUserDBUpdate(prevValue=>!prevValue);

            // Set a Timeout then jump to the Home Page
            setTimeout(()=>{
                // Direct to Home Page
                navigate(CONST_PATH.home); // '/home'

            }, CONST_LOG_IN_DELAY_MS);    
        }
        catch(error)
        {
            setCurrentUser(null);
        }

        // Whatever, reset the form data
        resetFormData();

        setDisableInput(false);
        setDisplaySpinner(false);
    }

    const GuestLogInComponent = memo(()=>{

        return (
            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '2rem'
            }}>
                <Typography component={'span'} variant='h3' id='id-app-name'>SimpleWork</Typography>

                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <p style={{width: '100%', fontSize: '20px', color: grey[700]}}>Note:</p>
                    <ul style={{listStyleType: 'disc'}}>
                        <li>
                            <p style={{textAlign: 'justify'}}>Guest account would be <span style={{color: 'orange'}}>removed </span> 
                             after logged out or <span style={{color: 'orange'}}>persisted ONE week only</span></p>
                        </li>
                        <li>
                            <p style={{textAlign: 'justify'}}>Guest account created <span style={{color: 'orange'}}>entries would be removed</span> after <span style={{color: 'orange'}}>ONE week</span></p>
                        </li>
                            
                    </ul>
                </div>

                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <p style={{width: '100%', fontSize: '20px', color: grey[700]}}>Disclaimer:</p>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <p style={{width: '100%', textAlign: 'justify'}}>This application is designed for non-commerical and education purpose only. It does not provide any security guarantees for sensitive information. Users are responsible for the accuracy and appropriateness of their entries, including any personally identifiable or sensitive data. We are not liable for any damages, losses, or misuse of information resulting from entries made by users. Please exercise caution and discretion when inputting your data. </p>

                        <p style={{width: '100%', textAlign: 'justify'}}>By pressing the "Guest LogIn" button below to start the trials of the application, users acknowledge and accept the above disclaimer, and understand that any data they enter will be treated as general input, and is not intended for the storage or handling of sensitive personal data.</p>
                    </div>
                </div>

                <Button 
                    fullWidth
                    disabled={isDisableInput}
                    id="id-button-guest-login"
                    variant="contained" 
                    onClick={clickGuestLogIn}
                    sx={{
                        fontSize: '18px',
                        backgroundColor: 'green'
                        // fontWeight: 'bold'
                    }}
                >
                        Guest LogIn
                </Button>

                <div className= "mt-10 w-full flex justify-center">
                    <Typography component={'span'} variant='h8'>Already Have An Account ? <a className="underline font-bold" href='#' onClick={()=>setToGuestLogIn(false)}>Log In</a></Typography>
                </div>
                
            </div>

        );
    });

    const FORM_ITEM_TAILWIND_STYLE = `mt-5 w-full`;

    return (
        <div className="flex justify-center" style={{width: '500px'}}>
            {/* <ThemeProvider theme={theme}> */}
                <Paper elevation={10} id="id-card-login"
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        paddingBottom: '2rem'
                    }}
                >
                    <div className="flex flex-col items-center w-96">

                        {
                            toGuestLogIn ?
                            <GuestLogInComponent />
                            :
                            <>
                                <Avatar className="my-10" id="id-icon-bkgrd-login"><VpnKeyIcon id="id-icon-login" /></Avatar>

                                <div className="mt-1 mb-8 flex flex-col items-center">
                                    <Typography component={'span'} variant='h4'
                                        sx={{
                                            color: grey[600]
                                        }}
                                    >
                                        Welcome To
                                    </Typography>
                                    <Typography component={'span'} variant='h4' id='id-app-name'>SimpleWork</Typography>
                                </div>

                                {/* return a Display Message Component */}
                                {DisplayMessageComponent()}

                                <div className={FORM_ITEM_TAILWIND_STYLE}>
                                    <InputEmailBox
                                        disabled={isDisableInput}
                                        emailValue = {formData.email}
                                        enterEmailCallBk = {enterInput('email')}
                                        isEmailError = {formInputErrors.email.isError}
                                        emailErrorMessage = {formInputErrors.email.message}
                                    />
                                </div>

                                <div className={FORM_ITEM_TAILWIND_STYLE}>
                                    <InputPasswordBox
                                        disabled={isDisableInput}
                                        sx={{
                                            opacity: isDisableInput ? 0.5 : 1,
                                        }}
                                        password = {formData.password}
                                        iconType = {passwordBoxIcon.showButton}
                                        showPassword = {showPassword}
                                        isPasswordError = {formInputErrors.password.isError}
                                        passwordErrorMessage = {formInputErrors.password.message}
                                        enterPasswordCallBk = {enterInput('password')}
                                        handleClickShowPassword = {handleClickShowPassword}
                                    />
                                </div>

                                <div className={FORM_ITEM_TAILWIND_STYLE}>
                                    <Button 
                                        fullWidth
                                        disabled={isDisableInput}
                                        id="id-button-login"
                                        variant="contained" 
                                        onClick={clickSubmit}>
                                            Log In
                                    </Button>
                                </div>

                                <div className= "mt-10 w-full flex justify-center">
                                    <Typography component={'span'} variant='h8'>Not Yet Have An Account ? <a className="underline font-bold" href='#' onClick={clickHandleToSignUp}>Sign Up</a></Typography>
                                </div>

                                <div className={FORM_ITEM_TAILWIND_STYLE}>
                                    <Button 
                                        fullWidth
                                        disabled={isDisableInput}
                                        id="id-button-guest-login"
                                        variant="contained" 
                                        onClick={()=>setToGuestLogIn(true)}
                                        sx={{
                                            fontSize: '14px',
                                            // fontWeight: 'bold'
                                        }}
                                    >
                                            Guest Trials LogIn Here
                                    </Button>
                                </div>
                            </>

                        }

                    </div>

                </Paper>
            {/* </ThemeProvider> */}
        </div>
    )
}

export default LogInform