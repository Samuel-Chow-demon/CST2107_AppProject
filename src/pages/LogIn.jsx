import React from 'react';
import {useNavigate} from 'react-router-dom';

import {createTheme, ThemeProvider,
        Paper, Typography, Avatar, Button } from '@mui/material';

import VpnKeyIcon from '@mui/icons-material/VpnKey';

import {validateEmailAndPasswordInput} from '../components/utility.js';
import {InputEmailBox, InputPasswordBox, passwordBoxIcon} from '../components/Input.jsx';

import {CONST_PATH, CONST_LOG_IN_DELAY_MS, 
        DEPLOYED_HOME_URL} from '../components/front_end_constant.js';

import {SERVER_URL, API_USER_URL} from '../components/front_end_constant.js'

import './Login.css';

const {useState, useEffect} = React;

const LogInform = () => {

    const navigate = useNavigate();

    // ********************************************** Declare useState Variable
    const initFormData = {
        email : '',
        password : ''
    }

    const [formData, setFormData] = useState(initFormData);

    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');


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
            }
        };
    
        return validateEmailAndPasswordInput(formData, funcInit, funcErrorHandle);
    }

    const clickSubmit = async (event)=>{

        console.log(formData.email + ", " + formData.password);

        if (validateInput())
        {
            // Do Post API
            try {
                const loginUser = await fetch(`${SERVER_URL}${API_USER_URL}/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                })
        
                const loginUserJSON = await loginUser.json();
        
                //console.log(loginUserJSON);
        
                if (loginUserJSON)
                {
                    //alert(loginUserJSON.message);

                    // Here Display Log In Success Component (not finish)

                    // Wait for the next browser repaint using requestAnimationFrame
                    await new Promise(resolve => requestAnimationFrame(resolve));
        
                    if (loginUser.status === 200)
                    {
                        // Store the id and token to local Storage
                        localStorage.setItem('id', loginUserJSON.data.id);
                        localStorage.setItem('token', loginUserJSON.data.token);
        
                        // Wait for 550 ms
                        await new Promise(resolve => setTimeout(resolve, CONST_LOG_IN_DELAY_MS));
        
                        // Direct to Home Page
                        navigate(DEPLOYED_HOME_URL ? `${DEPLOYED_HOME_URL}/home` : CONST_PATH.home); // '/home'
                    }
                    else
                    {
                        // remove the token and email whatever if any fail
                        if (localStorage.getItem('id') != null)
                        {
                            localStorage.removeItem('id');
                        }
        
                        if (localStorage.getItem('token') != null)
                        {
                            localStorage.removeItem('token');
                        }
                    }
                }
            }
            catch(error){
        
                // Here display the Sign Up Fail Component (not finish)

                alert(`Error : ${error}`);
            }

            // Whatever, reset the form data
            setFormData(initFormData);
        }
    };

    return (
        <div className="flex justify-center">
            <ThemeProvider theme={theme}>
                <Paper elevation={10} id="id-card-login" className="flex justify-center aligns-center py-20 mt-20">
                    <div className="flex flex-col items-center w-96">
                        <Avatar className="my-10" id="id-icon-bkgrd-login"><VpnKeyIcon id="id-icon-login" /></Avatar>

                        <div className="mt-1 mb-8 flex flex-col items-center">
                            <Typography variant='h4'>Welcome To</Typography>
                            <Typography variant='h4' id='id-app-name'>SimpleWork</Typography>
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputEmailBox
                                emailValue = {formData.email}
                                enterEmailCallBk = {enterEmail}
                                isEmailError = {emailError}
                                emailErrorMessage = {emailErrorMessage}
                            />
                        </div>

                        <div className={FORM_ITEM_TAILWIND_STYLE}>
                            <InputPasswordBox
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
                                id="id-button-login"
                                variant="contained" 
                                onClick={clickSubmit}>
                                    Log In
                            </Button>
                        </div>
                    </div>

                </Paper>
            </ThemeProvider>
        </div>
    )
}

export default LogInform