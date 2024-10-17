import axios from 'axios';
import {SERVER_URL, API_USER_URL,
        LANDING_URL} from './front_end_constant.js'


function validateEmailAndPasswordInput (formData, funcInit, funcErrorHandle) 
{
    const PASSWORD_MIN_LENGTH = 6;
    
    let passwordError = '';
    let emailError = '';

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

    if (funcErrorHandle)
    {
        funcErrorHandle(emailError, passwordError)
    }
    
    return !(emailError || passwordError);
}

function funcReturnLogInPageHandle(promptMessage = "")
{
    // remove the token and email whatever if any fail
    if (localStorage.getItem('id') != null)
    {
        localStorage.removeItem('id');
    }

    if (localStorage.getItem('token') != null)
    {
        localStorage.removeItem('token');
    }

    if (promptMessage)
    {
        alert(promptMessage);
    }

    window.location.href = `${LANDING_URL}`;
}

async function checkIfUserLoggedInValid()
{
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');

    const funcReturn = (valid, loginUserJSON, message)=>{

        return {
                valid,
                loginUserJSON,
                message
                };
    }

    if (!token || !id)
    {
        funcReturnLogInPageHandle(`User Token Not Found`);
        return funcReturn(false, null, `User Token Not Found`);
    }

    // Fetch Get to Database to check if the latest token in the database matched to client storage
    try {

        // Do not know why the axios keep return the 302 redirect error even setting the CORS config. in the server

        // let loggedinResponse = await axios.get(`${SERVER_URL}${API_USER_URL}/${id}`, {
        //     maxRedirects: 0
        // });

        // // A redirect exist
        // if (loggedinResponse.status == 302)
        // {
        //     // Get the redirect URL from the 'Location' header
        //     const redirectUrl = response.headers['location'];
        //     console.log('Redirecting to:', redirectUrl);

        //     // Make a new request to the redirect URL
        //     loggedinResponse = await axios.get(redirectUrl);
        //     console.log('Redirected Response:', loggedinResponse.data);
        // }
        // const loginUserJSON = loggedinResponse.data;

        // Use fetch can auto redirect smoothly if exist
        const loggedinUser = await fetch(`${SERVER_URL}${API_USER_URL}/${id}`);     
        const loginUserJSON = await loggedinUser.json();
        
        if (loginUserJSON)
        {
            console.log(loginUserJSON.data.token, " ", token);
            if (token != loginUserJSON.data.token)
            {
                funcReturnLogInPageHandle(`New User Login Detected.`);
                return funcReturn(false, loginUserJSON, `New User Login Detected.`);
            }
            return funcReturn(true, loginUserJSON, ``);
        }
        else
        {
            funcReturnLogInPageHandle(`User Token Comparison Fail`);
            return funcReturn(false, null, `User Token Comparison Fail`);
        }
    }
    catch(error)
    {
        funcReturnLogInPageHandle(`User Token Comparison Error : ${error}`);
        return funcReturn(false, null, `User Token Comparison Error : ${error}`);
    }
}

export {validateEmailAndPasswordInput, 
        funcReturnLogInPageHandle,
        checkIfUserLoggedInValid
};
