import React from 'react';
import {createTheme, ThemeProvider,
        Paper, Typography, Avatar,
        TextField  } from '@mui/material';

import {InputLabel, OutlinedInput, InputAdornment,
        FormControl, IconButton, Button, FormHelperText  } from '@mui/material';

import { Visibility, VisibilityOff} from '@mui/icons-material';

import VpnKeyIcon from '@mui/icons-material/VpnKey';

const {useState, useEffect} = React;

const LogInform = () => {

    const [formData, setFormData] = useState({
        email : '',
        password : ''
    })

    const PASSWORD_MIN_LENGTH = 6;

    const [showPassword, setShowPassword] = useState(false);

    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');

    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };

    const theme = createTheme({
        typography:{
            fontFamily: 'Monospace, Helvetica, Roboto, sens-serif',
        }
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

    function validateInput () 
    {
        let passwordError = '';
        let emailError = '';

        setEmailError(false);
        setEmailErrorMessage('');

        setPasswordError(false);
        setPasswordErrorMessage('');

        // Check the Email must be chars + @ + chars + . + chars
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) 
        {
            emailError = 'Please enter a valid email.';
        } 

        // At least have one Upper case
        // one special character except space
        // one number
        const passwordPolicy1 = /^(?=.*[A-Z]).*$/;
        const passwordPolicy2 = /^(?=.*[0-9]).*$/;
        const passwordPolicy3 = /^(?=.*[^a-zA-Z0-9]).*$/;

        if (!formData.password || formData.password.length < PASSWORD_MIN_LENGTH) 
        {
            passwordError = 'Password must be at least 6 characters long.';
        }
        else if (!passwordPolicy1.test(formData.password))
        {
            passwordError = 'Password must include at least ONE Upper case letter.';
        }
        else if (!passwordPolicy2.test(formData.password))
        {
            passwordError = 'Password must include ONE numerical letter.';
        }
        else if (!passwordPolicy3.test(formData.password))
        {
            passwordError = 'Password must include ONE special character.';
        }

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
        
        return !(emailError || passwordError);
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
                            <TextField
                                fullWidth
                                id="input-signin-email"
                                label="Email"
                                autoComplete='email'
                                error={emailError}
                                helperText={emailErrorMessage}
                                color={emailError ? 'error' : 'primary'}
                                value={formData.email}
                                placeholder='your@email.com'
                                size='Normal'
                                onChange={enterEmail}
                            />
                        </div>

                        <div className="mt-5 w-full">
                            <FormControl fullWidth variant="outlined" error={passwordError}>
                                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                                <OutlinedInput
                                    id="input-signin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    color={passwordError ? 'error' : 'primary'}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                onMouseUp={handleMouseUpPassword}
                                                edge="end"
                                            >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    onChange={enterPassword}
                                />
                                {passwordError && (
                                    <FormHelperText>{passwordErrorMessage}</FormHelperText>
                                )}
                            </FormControl>
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