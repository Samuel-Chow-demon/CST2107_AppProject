import React from 'react'
import {InputLabel, OutlinedInput, InputAdornment,
        FormControl, IconButton, FormHelperText,
        TextField } from '@mui/material';

import { Visibility, VisibilityOff} from '@mui/icons-material';

const InputEmailBox = ({emailValue, enterEmailCallBk, isEmailError, emailErrorMessage}) => {

  return (
    <>
        <TextField
            fullWidth
            id="input-signin-email"
            label="Email"
            autoComplete='email'
            error={isEmailError}
            helperText={emailErrorMessage}
            color={isEmailError ? 'error' : 'primary'}
            value={emailValue}
            placeholder='your@email.com'
            size='Normal'
            onChange={enterEmailCallBk}
        />
    </>
  )
}

const InputPasswordBox = ({password, enterPasswordCallBk, showPassword, isPasswordError, passwordErrorMessage,
                            handleClickShowPassword, handleMouseDownPassword = null, handleMouseUpPassword = null}) =>{

    const handleByPass = (event) => {
        event.preventDefault();
    };

    return (
        <>
            <FormControl fullWidth variant="outlined" error={isPasswordError}>
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                    id="input-signin-password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    color={isPasswordError ? 'error' : 'primary'}
                    value={password}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword || handleByPass}
                                onMouseUp={handleMouseUpPassword || handleByPass}
                                edge="end"
                            >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    }
                    onChange={enterPasswordCallBk}
                />
                {isPasswordError && (
                    <FormHelperText>{passwordErrorMessage}</FormHelperText>
                )}
            </FormControl>
        </>
    )
}

export {InputEmailBox, InputPasswordBox}