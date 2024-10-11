import React from 'react';
import {useNavigate} from 'react-router-dom';

import {createTheme, ThemeProvider,
        Paper, Typography, Avatar, Button, 
        TextField,
        CircularProgress} from '@mui/material';

import FaceIcon from '@mui/icons-material/Face';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

import {validateEmailAndPasswordInput} from '../components/utility.js';
import {InputEmailBox, InputPasswordBox, passwordBoxIcon} from '../components/Input.jsx';

import {CONST_PATH, CONST_LOG_IN_DELAY_MS, 
        DEPLOYED_HOME_URL} from '../components/front_end_constant.js';

import {SERVER_URL, API_USER_URL} from '../../backends/module_constant.js'

import {DisplayMessage} from '../components/display';

// Use CSS for styling
import './SignUp.css'

const {useState, useEffect} = React;


const SignUpform = () => {

    const navigate = useNavigate();

    // ********************************************** Declare useState Variable
    const initFormData = {
        email : '',
        password : '',
        confirm_password : '',
        username : ''
    }

    const [formData, setFormData] = useState(initFormData);

    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const [passwordConfirmError, setPasswordConfirmError] = useState(false);
    const [passwordConfirmErrorMessage, setPasswordConfirmErrorMessage] = useState('');

    const [confirmPasswordIcon, setConfirmIconType] = useState(passwordBoxIcon.none);

    const [showSpinner, setShowSpinner] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');

    const [okMessage, setOkMessage] = useState('Registered Successfully');


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

    const enterConfirmPassword = (event)=>{

        setPasswordConfirmError(false);
        setPasswordConfirmErrorMessage('');

        setFormData({
            ...formData,
            confirm_password: event.target.value
        })
    };

    const enterUsername = (event)=>{

        setFormData({
            ...formData,
            username: event.target.value
        })
    };

    const clearAllInput = (event)=>{

        setFormData({
            ...formData,
            username: event.target.value
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

    // ********************************************** Declare Effect

    // Effect on checking confirm password
    useEffect(() =>{

        if (formData?.password?.length <= 0)
        {
            setFormData({
                ...formData,
                confirm_password: ''
            })
        }

        if (formData?.confirm_password?.length <= 0)
        {
            setConfirmIconType(passwordBoxIcon.none);
        }
        else if (formData?.password?.length > 0 &&
                formData.confirm_password === formData.password)
        {
            setConfirmIconType(passwordBoxIcon.correctIcon);
        }
        else
        {
            setConfirmIconType(passwordBoxIcon.wrongIcon);
        }

    }, [formData.confirm_password, formData.password]);




    // ********************************************** Create Style
    const theme = createTheme({

        // Current use !important controlled by index.css
        // typography:{
        //     fontFamily: 'Lato, Roboto, Monospace, Helvetica, sens-serif',
        // }
    })

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

                setFormData({
                    ...formData,
                    confirm_password: ''
                })
            }
        };
    
        if (validateEmailAndPasswordInput(formData, funcInit, funcErrorHandle))
        {
            if (formData.password != formData.confirm_password)
            {
                setPasswordConfirmError(true);
                setPasswordConfirmErrorMessage('Confirm Password Not Matched');
                return false;
            }
            return true;
        }
        return false;
    }

    const clickSubmit = async (event)=>{

        // Call api to database
        console.log(formData.email + ", " + formData.password);

        if (validateInput())
        {
            // Here display the loading spinner
            setShowSpinner(true);

            // Do Post API
            try {
                const createdUser = await fetch(`${SERVER_URL}${API_USER_URL}/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                })
        
                const createdUserJSON = await createdUser.json();
        
                if (createdUserJSON)
                {
                    alert(createdUserJSON.message);
                    let messageSuccessRegister = `${createdUserJSON.message}`;

                    //let enumDisplay = eDISPLAY.FAIL;
        
                    if (createdUser.status === 201)
                    {
                        //enumDisplay = eDISPLAY.GOOD;
                        messageSuccessRegister += `<br>Here Bring You To The Login Page.`;
                    }
        
                    // Here Display Register Success Component (not finish)
                    hideMessageDisplay();
                    setOkMessage('Registered Successfully');

                    // Wait for the next browser repaint using requestAnimationFrame
                    await new Promise(resolve => requestAnimationFrame(resolve));
        
                    // Create Success to direct to log in page
                    if (createdUser.status === 201)
                    {
                        // Wait for 1500 ms
                        await new Promise(resolve => setTimeout(resolve, CONST_LOG_IN_DELAY_MS * 2));
        
                        // Drive to LogIn Page
                        navigate(DEPLOYED_HOME_URL ? `${DEPLOYED_HOME_URL}/login` : CONST_PATH.login); // '/login'
                    }
                }
            }
            catch(error){
                //alert(`Error : ${error}`);

                // Here display the Sign Up Fail Component (not finish)
                hideMessageDisplay();
                setOkMessage(`Register User ${formData.email} Fail (error : ${error})`);
            }
            
            // Whatever, reset the form data
            setFormData(initFormData);
        }
        else
        {
            hideMessageDisplay();
        }
    };

    return (
        <div className="flex justify-center">
            <ThemeProvider theme={theme}>
                <Paper elevation={10} id="id-card-signup" className="flex justify-center aligns-center py-20 mt-20">
                    <div className="flex flex-col items-center w-96">
                        <Avatar className="my-10" id="id-icon-bkgrd-signup"><FaceIcon id="id-icon-signup" /></Avatar>

                        <div className="mt-1 mb-10">
                            <Typography variant='h4'>Sign Up</Typography>
                        </div>

                        <DisplayMessage 
                            showSpinner = {showSpinner}
                            errorMsg = {errorMessageControl}
                            okMsg={okMessageControl}
                        />

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputEmailBox
                                emailValue = {formData.email}
                                enterEmailCallBk = {enterEmail}
                                isEmailError = {emailError}
                                emailErrorMessage = {emailErrorMessage}
                            />
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <TextField 
                                fullWidth
                                label="UserName"
                                value={formData.username}
                                placeholder='Hi, user'
                                size='Normal'
                                onChange={enterUsername}
                            />

                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputPasswordBox
                                password = {formData.password}
                                allowShowPassword = {true}
                                iconType = {passwordBoxIcon.showButton}
                                showPassword = {showPassword}
                                isPasswordError = {passwordError}
                                passwordErrorMessage = {passwordErrorMessage}
                                enterPasswordCallBk = {enterPassword}
                                handleClickShowPassword = {handleClickShowPassword}
                            />
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputPasswordBox
                                password = {formData.confirm_password}
                                displayLabel = {"Confirm Password"}
                                iconType = {confirmPasswordIcon}
                                showPassword = {false}
                                isPasswordError = {passwordConfirmError}
                                passwordErrorMessage = {passwordConfirmErrorMessage}
                                enterPasswordCallBk = {enterConfirmPassword}
                            />
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <Button 
                                fullWidth
                                id="id-button-signup"
                                variant="contained"
                                onClick={clickSubmit}>
                                    Sign Up
                            </Button>
                        </div>
                    </div>

                </Paper>
            </ThemeProvider>
        </div>
    )
}

export default SignUpform