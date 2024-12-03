import {LANDING_URL} from './front_end_constant.js'

import { getErrorCode } from '../fireStore/error.js';
import { signOut, EmailAuthProvider,
         updatePassword, updateProfile, updateEmail,
         reauthenticateWithCredential } from "firebase/auth";
import { auth } from '../firebaseConfig';

const confirmPassword = async (currentFirebaseUser, password) => {
    try {

        if (!currentFirebaseUser) {
            throw new Error("No user is signed in.");
        }

        // Create an EmailAuthCredential object
        const credential = EmailAuthProvider.credential(currentFirebaseUser.email, password);

        // Reauthenticate the user
        await reauthenticateWithCredential(user, credential);

        console.log("Password confirmed OK");
        return true;
    } catch (error) {
        console.error("Error confirming password:", error.message);
        return false;
    }
};

const updateUserProfile = async ({currentFirebaseUser, currentPassword,
                                  newPassword = "",
                                  newEmail = "",
                                  newUsername = ""
                                }) => {
    try {

        if (!currentFirebaseUser) {
            throw new Error("No user is signed in.");
        }

        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(currentFirebaseUser.email, currentPassword);
        await reauthenticateWithCredential(currentFirebaseUser, credential);

        // Update email
        if (newEmail != "")
        {
            await updateEmail(currentFirebaseUser, newEmail);
            console.log("Updated Email OK");
        }

        // Update password
        if (newPassword != "")
        {
            await updatePassword(currentFirebaseUser, newPassword);
            console.log("Updated password OK");
        }

        // Update username
        if (newUsername != "")
        {
            await updateProfile(currentFirebaseUser, { displayName: newUsername });
            console.log("Display name updated successfully!");
        }
        
        console.log("Updated OK");
        return "";

    } catch (error) {

        const errMessage = getErrorCode(error.code);
        console.error("Error updating profile:", error.message, errMessage);
        return errMessage;
    }
};

async function signOutUser(setCurrentUser) 
{
    try {
        console.log("User signed out _ 1");
        setCurrentUser((prevState)=>({
            ...prevState,
            loggedIn: false
        }));
        await signOut(auth);
        console.log("User signed out _ 2");
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

    console.log("Check", firebaseUser);
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

function capitalizeFirstLetter(str) 
{
    if (!str) return ''; // Handle empty strings
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function getRandomRGBString(opacity = 1)
{
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return {
        solid : `rgb(${r}, ${g}, ${b})`,
        opacity : `rgba(${r}, ${g}, ${b}, ${opacity})`
    };
}

function getRandomPurpleColor() {
    const hue = Math.floor(Math.random() * 31) + 260; // Random hue between 260 and 290
    const saturation = Math.floor(Math.random() * 21) + 60; // Saturation between 60% and 80%
    const lightness = Math.floor(Math.random() * 21) + 40; // Lightness between 40% and 60%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

export {funcReturnLogInPageHandle,
        checkIfUserLoggedInValid,
        signOutUser,
        capitalizeFirstLetter,
        getRandomRGBString, getRandomPurpleColor,
        confirmPassword, updateUserProfile
};
