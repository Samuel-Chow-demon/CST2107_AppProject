import React from 'react';
import {createTheme, ThemeProvider,
        Paper, Typography, Avatar, Button } from '@mui/material';

import VpnKeyIcon from '@mui/icons-material/VpnKey';

import {validateEmailAndPasswordInput} from '../components/utility.js';
import {InputEmailBox, InputPasswordBox} from '../components/Input.jsx';

const {useState, useEffect} = React;

const LogInform = () => {

    // ********************************************** Declare useState Variable
    const [formData, setFormData] = useState({
        email : '',
        password : ''
    })

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

    const cardStyle = {
        width : '600px',
    };

    const iconBgStyle = {
        backgroundColor:'rgb(88 181 88)',
        width : 56,
        height : 56
    };

    const iconStyle = {
        fontSize : 40
    };

    const buttonStyle = {
        backgroundColor :'green',
        variant : "contained",
        fontSize : '18px',
        fontWeight : 'bold',
        color : 'white' 
    };

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

    const clickSubmit = (event)=>{

        console.log(formData.email + ", " + formData.password);

        if (validateInput())
        {
            // Do Post API
        }
    };

    return (
        <div className="flex justify-center">
            <ThemeProvider theme={theme}>
                <Paper elevation={10} style={cardStyle} className="flex justify-center aligns-center py-20 mt-20">
                    <div className="flex flex-col items-center">
                        <Avatar className="my-10" style={iconBgStyle}><VpnKeyIcon style={iconStyle} /></Avatar>
                        <Typography className="my-10" variant='h4'>Welcome To SimpleWork</Typography>

                        <div className="mt-20 w-full">
                            <InputEmailBox
                                emailValue = {formData.email}
                                enterEmailCallBk = {enterEmail}
                                isEmailError = {emailError}
                                emailErrorMessage = {emailErrorMessage}
                            />
                        </div>

                        <div className="mt-5 w-full">
                            <InputPasswordBox
                                password = {formData.password}
                                showPassword = {showPassword}
                                isPasswordError = {passwordError}
                                passwordErrorMessage = {passwordErrorMessage}
                                enterPasswordCallBk = {enterPassword}
                                handleClickShowPassword = {handleClickShowPassword}
                            />
                        </div>

                        <div className="mt-5 w-full">
                            <Button 
                                fullWidth 
                                style={buttonStyle}
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