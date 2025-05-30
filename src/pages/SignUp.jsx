
import {Paper, Typography, Avatar, Button, 
        TextField} from '@mui/material';

import FaceIcon from '@mui/icons-material/Face';

import {InputEmailBox, InputPasswordBox, passwordBoxIcon} from '../components/Input.jsx';

import {CONST_LOG_IN_DELAY_MS} from '../components/front_end_constant.js';

import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getErrorCode } from '../fireStore/error.js';

import useInputForm from '../hooks/useInputForm.js'

// Use CSS for styling
import './SignUp.css'
import useDisplayMessage from '../hooks/useDisplayMessage.jsx';
import { grey } from '@mui/material/colors';
import { useEffect } from 'react';

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

    const {
        setDisplaySpinner,
        hideDisplay, setDisplayOKMsg,
        setDisplayErrorMsg,
        DisplayMessageComponent
      } = useDisplayMessage();


    useEffect(()=>{

        setDisableInput(true);

    }, [])


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

        if (validateInput({}))
        {
            //console.log(SERVER_URL);

            // Here display the loading spinner
            setDisplaySpinner(true);

            // Do Post API
            try {

                const user = await createUser(formData);

                //console.log(user);

                // Here means register success
                setDisplayOKMsg("New User Registered Successfully");

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
                setDisplayErrorMsg(`Register User ${formData.email} Fail (${errMessage})`);
            }
            
            // Whatever, reset the form data
            resetFormData();
        }
        else
        {
            hideDisplay();
        }
        setDisableInput(false);
    };

    const FORM_ITEM_TAILWIND_STYLE = `mt-5 w-full`;

    return (
        <div className="flex justify-center" style={{width: '500px'}}>
            <Paper elevation={10} id="id-card-signup"
                sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        paddingBottom: '2rem'
                    }}
            >
                <div className="flex flex-col items-center w-96">
                    <Avatar className="my-10" id="id-icon-bkgrd-signup"><FaceIcon id="id-icon-signup" /></Avatar>

                    <div className="mt-1 mb-10">
                        <Typography component={'span'} variant='h5'
                            sx={{
                                color: grey[700]
                            }}
                        >
                            Sign Up (temporarily disabled)
                        </Typography>
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