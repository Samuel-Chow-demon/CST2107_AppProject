import {useState, useEffect} from 'react';

import {Paper, Typography, Avatar, Button, 
        TextField} from '@mui/material';

import FaceIcon from '@mui/icons-material/Face';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

import {InputEmailBox, InputPasswordBox, passwordBoxIcon} from '../components/Input.jsx';

import {CONST_LOG_IN_DELAY_MS,
        SERVER_URL} from '../components/front_end_constant.js';

import {DisplayMessage} from '../components/display';

import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getErrorCode } from '../fireStore/error.js';

import useInputForm from '../hooks/useInputForm.js'

// Use CSS for styling
import './SignUp.css'

const SignUpform = ({clickHandleToLogin}) => {

    // ********************************************** Declare useState Variable
    const initFormData = {
        email : '',
        password : '',
        passwordConfirm : '',
        username : ''
    }

    // Use the form data hooks
    const {
        formData, resetFormData,
        enterInput,
        confirmPasswordIcon,
        showPassword, handleClickShowPassword,
        isDisableInput, setDisableInput,
        formInputErrors,
        validateInput
    } = useInputForm(initFormData);


    const [showSpinner, setShowSpinner] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [okMessage, setOkMessage] = useState('');


    // ********************************************** Declare function

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


    // ********************************************** Create Function

    async function createUser(formData)
    {
        const {user} = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

        // Add username stored into the profile "displayName"
        await updateProfile(user, {displayName: formData.username});

        await auth.currentUser.reload();

        console.log("Updated display name:", auth.currentUser.displayName);

        return user;
    }

    const clickSubmit = async (event)=>{

        setDisableInput(true);

        if (validateInput())
        {
            //console.log(SERVER_URL);

            // Here display the loading spinner
            setShowSpinner(true);

            // Do Post API
            try {

                const user = await createUser(formData);

                console.log(user);

                // Here means register success
                hideMessageDisplay();
                setOkMessage("New User Registered Successfully");

                // Wait for the next browser repaint using requestAnimationFrame
                await new Promise(resolve => requestAnimationFrame(resolve));

                // Set a Timeout then jump to the LogIn Tab
                setTimeout(()=>{
                    // Drive to LogIn Page
                    clickHandleToLogin();

                }, CONST_LOG_IN_DELAY_MS * 2);
            }
            catch(error){
                //alert(`Error : ${error}`);

                // Here display the Sign Up Fail Component
                const errMessage = getErrorCode(error.code);
                hideMessageDisplay();
                setErrorMessage(`Register User ${formData.email} Fail (${errMessage})`);
            }
            
            // Whatever, reset the form data
            resetFormData();
        }
        else
        {
            hideMessageDisplay();
        }
        setDisableInput(false);
    };

    const FORM_ITEM_TAILWIND_STYLE = `mt-5 w-full`;

    return (
        <div className="flex justify-center">
            <Paper elevation={10} id="id-card-signup" className="flex justify-center aligns-center py-20">
                <div className="flex flex-col items-center w-96">
                    <Avatar className="my-10" id="id-icon-bkgrd-signup"><FaceIcon id="id-icon-signup" /></Avatar>

                    <div className="mt-1 mb-10">
                        <Typography component={'span'} variant='h4'>Sign Up</Typography>
                    </div>

                    <DisplayMessage 
                        showSpinner = {showSpinner}
                        errorMsg = {errorMessageControl}
                        okMsg={okMessageControl}
                    />

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
                        <TextField 
                            fullWidth
                            required
                            disabled={isDisableInput}
                            sx={{
                                opacity: isDisableInput ? 0.5 : 1,
                            }}
                            error={formInputErrors.username.isError}
                            helperText={formInputErrors.username.message}
                            label="UserName"
                            value={formData.username}
                            placeholder='Hi, user'
                            size='Normal'
                            onChange={enterInput('username')}
                        />

                    </div>

                    <div className={FORM_ITEM_TAILWIND_STYLE}>
                        <InputPasswordBox
                            disabled={isDisableInput}
                            password = {formData.password}
                            allowShowPassword = {true}
                            iconType = {passwordBoxIcon.showButton}
                            showPassword = {showPassword}
                            isPasswordError = {formInputErrors.password.isError}
                            passwordErrorMessage = {formInputErrors.password.message}
                            enterPasswordCallBk = {enterInput('password')}
                            handleClickShowPassword = {handleClickShowPassword}
                        />
                    </div>

                    <div className={FORM_ITEM_TAILWIND_STYLE}>
                        <InputPasswordBox
                            disabled={isDisableInput}
                            password = {formData.passwordConfirm}
                            displayLabel = {"Confirm Password"}
                            iconType = {confirmPasswordIcon}
                            showPassword = {false}
                            isPasswordError = {formInputErrors.passwordConfirm.isError}
                            passwordErrorMessage = {formInputErrors.passwordConfirm.message}
                            enterPasswordCallBk = {enterInput('passwordConfirm')}
                        />
                    </div>

                    <div className={FORM_ITEM_TAILWIND_STYLE}>
                        <Button 
                            fullWidth
                            disabled={isDisableInput}
                            sx={{
                                opacity: isDisableInput ? 0.5 : 1,
                            }}
                            id="id-button-signup"
                            variant="contained"
                            onClick={clickSubmit}>
                                Sign Up
                        </Button>
                    </div>

                    <div className= "mt-10 w-full flex justify-center">
                        <Typography component={'span'} variant='h8'>Already Have An Account ? <a className="underline font-bold" href='#' onClick={clickHandleToLogin}>Log In</a></Typography>
                    </div>
                </div>

            </Paper>
        </div>
    )
}

export default SignUpform