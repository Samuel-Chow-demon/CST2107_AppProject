import {memo, useContext, useEffect} from 'react'
import { useLocation } from 'react-router-dom';
import { useUserDB } from '../context/userDBContext.jsx';
import {useAuth} from '../context/authContext.jsx'
import userContext from '../context/userContext.js'
import {checkIfUserLoggedInValid, funcReturnLogInPageHandle} from './utility.js';
import { CONST_PATH } from './front_end_constant.js';

const LogInExpireChecker = memo(() => {
  
    const location = useLocation();
    const {_currentUser, setCurrentUser} = useContext(userContext);
    const {firebaseUser, isLoading} = useAuth();
    const { updateUserDB, checkIfUserDocExist, isUserDBLoading } = useUserDB();

    useEffect(() => {
        if (_currentUser)
        {
            console.log("Log In Checking. . .");
            if (_currentUser.loggedIn)
            {
                if (!isLoading && 
                    !_currentUser.isUpdating &&
                    !isUserDBLoading)
                {
                    //console.log("after load", _currentUser);

                    if (_currentUser?.isGuest ?? false)
                    {
                        const checkIfNeedLogOutGuest = async()=>{

                            const isExist = await checkIfUserDocExist({uid : _currentUser.uid});

                            if (!isExist)
                            {
                                await funcReturnLogInPageHandle(setCurrentUser, updateUserDB, _currentUser.uid,
                                                                `Session Ended / Expired Detected. Log In Again`);
                            }
                        }
                        checkIfNeedLogOutGuest();
                    }
                    else
                    {
                        checkIfUserLoggedInValid(firebaseUser, updateUserDB, _currentUser, setCurrentUser);
                    }
                }
            }
            else
            {
                setCurrentUser(null); // here clear local storage of logged out
            }
        }
        else
        {
            if (location.pathname != CONST_PATH.landing &&
                location.pathname != CONST_PATH.signInUp)
            {
                checkIfUserLoggedInValid(firebaseUser, updateUserDB, _currentUser, setCurrentUser);
            }
        }
    }, [location.pathname, isLoading, isUserDBLoading, firebaseUser, _currentUser]); // The empty dependency array ensures this runs only on mount and unmount

    return <></>;
});

export default LogInExpireChecker;