import {LANDING_URL} from './front_end_constant.js'

import { getErrorCode } from '../fireStore/error.js';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig';


function validateAccountSetupInput (formData, funcInit, funcErrorHandle) 
{
    const PASSWORD_MIN_LENGTH = 6;
    
    let passwordError = '';
    let emailError = '';
    let nameError = '';

    // CallBack Function if funcInit != null
    if (funcInit)
    {
        funcInit();
    }

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

    if (!formData.username)
    {
        nameError = 'Username cannot be empty';
    }

    if (funcErrorHandle)
    {
        funcErrorHandle(emailError, passwordError, nameError);
    }
    
    return !(emailError || passwordError || nameError);
}

async function signOutUser(setCurrentUser) 
{
    try {
        await signOut(auth);
        setCurrentUser(null);
        console.log("User signed out.");
        return true;
    } catch (error) {
        console.error("Error signing out:", error);
    }
    return false;
}

async function funcReturnLogInPageHandle(setCurrentUser,
                                   promptMessage = "",
                                   needPromptMsg = true,
                                   needDirectBackToLandingPage = true)
{
    // remove the token and email whatever if any fail
    await signOutUser(setCurrentUser);

    if (promptMessage && needPromptMsg)
    {
        alert(promptMessage);
    }

    if (needDirectBackToLandingPage)
    {
        window.location.href = `${LANDING_URL}`;
    }
}

async function checkIfUserLoggedInValid(firebaseUser,
                                        _currentUser, setCurrentUser,
                                        needPromptIfError = true,
                                        needDirectBackToLangPageIfError = true)
{
    const funcReturn = (valid, userObj, message)=>{

        return {
                valid,
                userObj,
                message
                };
    }

    //console.log(_currentUser);

    //console.log("Check", firebaseUser);
    const user = firebaseUser;

    if (!user ||
        !_currentUser ||
        !_currentUser.token || !_currentUser.uid)
    {
        await funcReturnLogInPageHandle(setCurrentUser, 
                                    `No Authenticated User Found`,
                                    needPromptIfError,
                                    needDirectBackToLangPageIfError);
        return funcReturn(false, null, `No Authenticated User Found`);
    }

    // Get from Database to check if the latest token in the database matched to client storage
    try {

        const userTokenFromAuth = await user.getIdTokenResult();

        //console.log("Auth  " +  userTokenFromAuth.token);
        //console.log("local  " + _currentUser.token);
       
        if (userTokenFromAuth.token != _currentUser.token)
        {
            await funcReturnLogInPageHandle(setCurrentUser,
                                        `New User Login Detected.`,
                                        needPromptIfError,
                                        needDirectBackToLangPageIfError);
            return funcReturn(false, user, `New User Login Detected.`);
        }
        return funcReturn(true, user, ``);
    }
    catch(error)
    {
        const errMessage = getErrorCode(error.code);
        await funcReturnLogInPageHandle(setCurrentUser,
                                    `User Token Comparison Error : ${errMessage}`,
                                    needPromptIfError,
                                    needDirectBackToLangPageIfError);
        return funcReturn(false, null, `User Token Comparison Error : ${errMessage}`);
    }
}

export {validateAccountSetupInput, 
        funcReturnLogInPageHandle,
        checkIfUserLoggedInValid,
        signOutUser
};
