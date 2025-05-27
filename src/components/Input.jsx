
import {InputLabel, OutlinedInput, InputAdornment,
        FormControl, IconButton, FormHelperText,
        TextField } from '@mui/material';

import { Visibility, VisibilityOff} from '@mui/icons-material';
import DangerousIcon from '@mui/icons-material/Dangerous';
import CheckIcon from '@mui/icons-material/Check';

const InputEmailBox = ({emailValue, enterEmailCallBk, isEmailError, emailErrorMessage,
                        disableOpacity = 0.5,
                        disabled = false}) => {

  return (
    <>
        <TextField
            fullWidth
            disabled={disabled}
            sx={{
                opacity: disabled ? disableOpacity : 1,
            }}
            //id="input-email"
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

const passwordBoxIcon = {
    showButton : 0,
    wrongIcon : 1,
    correctIcon : 2,
    none : 3
}

const InputPasswordBox = ({password, enterPasswordCallBk, showPassword, isPasswordError, passwordErrorMessage,
                            disableOpacity = 0.5,
                            iconType = null, displayLabel = 'Password', disabled = false,
                            handleClickShowPassword = null, handleMouseDownPassword = null, handleMouseUpPassword = null}) =>{

    const handleByPass = (event) => {
        event.preventDefault();
    };

    // Prevent right-click menu and text selection
    const handleContextMenu = (event) => {
        event.preventDefault(); // Disable right-click
    };

    const preventCopy = (event) => {
        event.preventDefault(); // Disable copy
    };

    const labelStyle = {
        backgroundColor: 'white',
        padding: '0 2px'
    }

    let iconComponent = null;
    switch (iconType)
    {
        case passwordBoxIcon.showButton:
            iconComponent = (
                                <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword || handleByPass}
                                    onMouseDown={handleMouseDownPassword || handleByPass}
                                    onMouseUp={handleMouseUpPassword || handleByPass}
                                    edge="end"
                                >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            );
            break;

        case passwordBoxIcon.correctIcon:
            iconComponent = (
                                <CheckIcon style={{color:'green'}}/>
                            );
            break;                    

        case passwordBoxIcon.wrongIcon:
            iconComponent = (
                                <DangerousIcon style={{color:'gray'}}/>
                            );
            break;
        default:
            break;
    }


    return (
        <>
            <FormControl fullWidth variant="outlined" error={isPasswordError}>
                <InputLabel htmlFor="outlined-adornment-password" style={labelStyle}>{displayLabel}</InputLabel>
                <OutlinedInput
                    //id="input-password"
                    disabled={disabled}
                    sx={{
                        opacity: disabled ? disableOpacity : 1,
                    }}
                    type={showPassword ? 'text' : 'password'}
                    label='Password'
                    color={isPasswordError ? 'error' : 'primary'}
                    value={password}
                    onContextMenu={handleContextMenu}   // Disable right-click
                    onCopy={preventCopy}                // Disable copy
                    onCut={preventCopy}                 // Disable cut
                    onPaste={preventCopy}               // Disable paste
                    endAdornment={
                        <InputAdornment position="end">
                            {iconComponent}
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

export {InputEmailBox, InputPasswordBox, passwordBoxIcon}