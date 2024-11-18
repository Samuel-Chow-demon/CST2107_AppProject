import { Avatar, Box, TextField } from '@mui/material'
import {useContext, useEffect, useState} from 'react'
import userContext from '../context/userContext';
import useInputForm from '../hooks/useInputForm';
import { useAuth } from '../context/authContext';
import { getRandomRGBString } from '../components/utility';
import { grey } from '@mui/material/colors';
import { InputEmailBox, InputPasswordBox, passwordBoxIcon } from '../components/Input';

const UserProfile = () => {

  const {firebaseUser, isLoading} = useAuth();

  const {_currentUser, setCurrentUser} = useContext(userContext);

  const {avatarColor, setAvatarColor} = useState(getRandomRGBString().solid);

 
  const profileUser = {
        email : '',
        oldPassword: '',
        password : '',
        passwordConfirm : '',
        username : ''
    }

  // Use the form data hooks
  const {
        formData, setFormData, resetFormData,
        enterInput,
        confirmPasswordIcon,
        showPassword, handleClickShowPassword,
        isDisableInput, setDisableInput,
        formInputErrors,
        validateInput
    } = useInputForm(profileUser);

    useEffect(()=>{
        setDisableInput(true);
    }, []);

    useEffect(()=>{
        
        if (!isLoading)
        {
            console.log("profile", firebaseUser);
            setFormData({
                ...formData,
                email : firebaseUser.email,
                username : firebaseUser.displayName
            })

        }
    }, [isLoading]);

  return (
    <>
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            padding: '2rem',
            height: '100%',
            width: '100%',
            backgroundColor: grey[100]
        }}>
            {/* Avatar */}
            <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'left',
                    marginTop: '20px',
                    marginRight: '10px',
                    width: '10rem',
                    height: '100%',
                    gap: '10px'
                }}>
                <Avatar sx={{
                    bgcolor: avatarColor,
                    width: '8rem',
                    height: '8rem',
                    fontSize: '3rem',
                }}>
                    {(_currentUser.userName.at(0) + _currentUser.userName.at(-1)).toUpperCase()}
                </Avatar>
            </Box>

            <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'left',
                    paddingLeft: '20px',
                    gap: '10px',
                    width: '50rem',
                    height: '100%'
                }}>

                <TextField
                    fullWidth 
                    required
                    disabled={isDisableInput}
                    sx={{
                        opacity: isDisableInput ? 0.8 : 1,
                    }}
                    error={formInputErrors.username.isError}
                    helperText={formInputErrors.username.message}
                    label="UserName"
                    value={formData.username}
                    placeholder='Hi, user'
                    size='Normal'
                    onChange={enterInput('username')}
                />

                <InputEmailBox
                    disabled={isDisableInput}
                    disableOpacity={0.8}
                    emailValue = {formData.email}
                    enterEmailCallBk = {enterInput('email')}
                    isEmailError = {formInputErrors.email.isError}
                    emailErrorMessage = {formInputErrors.email.message}
                />

                <InputPasswordBox
                    displayLabel={'New Password'}
                    disableOpacity={0.8}
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

                <InputPasswordBox
                    disabled={isDisableInput}
                    disableOpacity={0.8}
                    password = {formData.passwordConfirm}
                    displayLabel = {"Confirm Password"}
                    iconType = {confirmPasswordIcon}
                    showPassword = {false}
                    isPasswordError = {formInputErrors.passwordConfirm.isError}
                    passwordErrorMessage = {formInputErrors.passwordConfirm.message}
                    enterPasswordCallBk = {enterInput('passwordConfirm')}
                />

                <InputPasswordBox
                    displayLabel={'Current Password'}
                    disableOpacity={0.8}
                    disabled={isDisableInput}
                    password = {formData.oldPassword}
                    allowShowPassword = {false}
                    iconType = {passwordBoxIcon.none}
                    showPassword = {false}
                    isPasswordError = {false}
                    passwordErrorMessage = {""}
                    enterPasswordCallBk = {enterInput('oldPassword')}
                />
                
            </Box>

        </Box>
    
    </>
  )
}

export default UserProfile