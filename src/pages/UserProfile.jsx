import { Avatar, Box, TextField, Typography } from '@mui/material'
import {memo, useCallback, useContext, useEffect, useState} from 'react'
import userContext from '../context/userContext';
import useInputForm from '../hooks/useInputForm';
import { useAuth } from '../context/authContext';
import { capitalizeFirstLetter, getRandomRGBString, updateUserProfile } from '../components/utility';
import { blue, blueGrey, green, grey } from '@mui/material/colors';
import { InputEmailBox, InputPasswordBox, passwordBoxIcon } from '../components/Input';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CloseIcon from '@mui/icons-material/Close';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import useDisplayMessage from '../hooks/useDisplayMessage';

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

    const {
        setDisplaySpinner,
        hideDisplay, setDisplayOKMsg,
        setDisplayErrorMsg,
        DisplayMessageComponent
      } = useDisplayMessage();

    useEffect(()=>{
        setDisableInput(true);
    }, []);

    useEffect(()=>{
        
        if (!isLoading && _currentUser.loggedIn)
        {
            console.log("profile", firebaseUser);
            setFormData({
                ...formData,
                email : firebaseUser.email,
                username : firebaseUser.displayName
            })

        }
    }, [isLoading, firebaseUser]);

    const editProfile = useCallback((bFlag)=>{
        hideDisplay();
        setDisableInput(bFlag);
    }, [setDisableInput]);

    const enterField = useCallback((field)=>(event)=>{
        hideDisplay();
        enterInput(field)(event);
    }, [enterInput]);

    const proceedChange = async ()=>{

        if (validateInput({byPassPasswordCheck : !formData.password})) // if no new password input, it can by pass the checking
        {
            setDisplaySpinner(true);

            setCurrentUser((prevData)=>({
                ...prevData,
                isUpdating : true
            }))

            const errorMessage = await updateUserProfile({currentFirebaseUser: firebaseUser,
                                     currentPassword : formData.oldPassword,
                                     newPassword : formData.password,
                                     newEmail : formData.email,
                                     newUsername : formData.username
            });

            if (errorMessage)
            {
                setDisplayErrorMsg(errorMessage);
            }
            else
            {
                setDisableInput(true);

                const userTokenFromAuth = await firebaseUser.getIdTokenResult();

                setCurrentUser((prevData)=>({
                    ...prevData,
                    userName : firebaseUser.displayName,
                    email : firebaseUser.email,
                    token : userTokenFromAuth.token,
                    isUpdating : false
                }))

                setFormData((prevData)=>({
                    ...prevData,
                    email : firebaseUser.email,
                    username : firebaseUser.displayName
                }));

                setDisplayOKMsg("Profile Updated Successfully");

                // Set Timer to hide the display Component
                setTimeout(()=>{
                    hideDisplay();
                }, 2000);
            }

            // Whatever, clear the password items
            setFormData((prevData)=>({
                ...prevData,
                oldPassword: '',
                password : '',
                passwordConfirm : ''
            }));

        }
    }

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

                <Box sx={{
                        margin: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        
                    }}>

                    <Box sx={{
                            display:'flex',
                            alignItems: 'center'
                        }}>

                        <Typography sx={{
                                marginRight: '10rem',
                                fontSize: '2rem',
                                color: grey[700]
                            }}>
                            {capitalizeFirstLetter(_currentUser.userName)}'s Profile
                        </Typography>
                    </Box>

                    {
                        isDisableInput ?

                        // Disable to show edit icon
                        (<Avatar sx={{ 
                            backgroundColor: blue[700],
                            color: blueGrey,
                            height: '3rem',
                            width: '3rem',
                            boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.4)", // Shadow
                            '&:hover' : {
                                backgroundColor: blue[200],
                                color: blueGrey[800]
                            }
                            }}
                            onClick={()=>editProfile(false)}>
                                <EditNoteIcon sx={{ fontSize: '2rem'}} />
                        </Avatar>) : 
                        // Not Disable show procee changes and cancel icon
                        (
                            <Box sx={{display:'flex', justifyContent:'space-around', width:'auto', gap:3}}>
                                <Avatar sx={{
                                      backgroundColor: green[700],
                                      color: blueGrey,
                                      height: '3rem',
                                      width: '3rem',
                                      boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.4)", // Shadow
                                      marginRight: '1px',
                                      '&:hover': {
                                            backgroundColor: green[400],
                                            color: blueGrey[800]
                                        }
                                    }}
                                    onClick={proceedChange}>
                                    <SaveAltIcon sx={{ fontSize: '2rem' }} />
                                </Avatar>
                                  
                                <Avatar sx={{
                                      backgroundColor: grey[700],
                                      color: blueGrey,
                                      height: '3rem',
                                      width: '3rem',
                                      boxShadow: "0px 5px 20px rgba(0, 0, 0, 0.4)", // Shadow
                                      marginRight: '0.5rem',
                                      '&:hover': {
                                          backgroundColor: grey[500],
                                          color: blueGrey[800]
                                      }
                                  }}
                                    onClick={()=>editProfile(true)}>
                                    <CloseIcon sx={{ fontSize: '2rem' }} />
                                </Avatar>
                            </Box>
                        )
                    }

                </Box>

                {DisplayMessageComponent()}

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
                    onChange={enterField('username')}
                />

                <InputEmailBox
                    disabled={isDisableInput}
                    disableOpacity={0.8}
                    emailValue = {formData.email}
                    enterEmailCallBk = {enterField('email')}
                    isEmailError = {formInputErrors.email.isError}
                    emailErrorMessage = {formInputErrors.email.message}
                />

                <InputPasswordBox
                    displayLabel={'New Password'}
                    disableOpacity={0.8}
                    disabled={isDisableInput}
                    password = {formData.password}
                    allowShowPassword = {true}
                    iconType = {isDisableInput ? passwordBoxIcon.none : passwordBoxIcon.showButton}
                    showPassword = {showPassword}
                    isPasswordError = {formInputErrors.password.isError}
                    passwordErrorMessage = {formInputErrors.password.message}
                    enterPasswordCallBk = {enterField('password')}
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
                    enterPasswordCallBk = {enterField('passwordConfirm')}
                />

                <InputPasswordBox
                    displayLabel={'Current Password'}
                    disableOpacity={0.8}
                    disabled={isDisableInput}
                    password = {formData.oldPassword}
                    allowShowPassword = {false}
                    iconType = {passwordBoxIcon.none}
                    showPassword = {false}
                    isPasswordError = {formInputErrors.oldPassword?.isError}
                    passwordErrorMessage = {formInputErrors.oldPassword?.message}
                    enterPasswordCallBk = {enterField('oldPassword')}
                />
                
            </Box>

        </Box>
    
    </>
  )
}

export default memo(UserProfile)