import {LANDING_URL} from './front_end_constant.js'

import { getErrorCode } from '../fireStore/error.js';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig';





    }


    }

async function signOutUser(setCurrentUser) 
{
    try {
        await signOut(auth);
        setCurrentUser(null);
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

        checkIfUserLoggedInValid,
};
