
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

export {validateEmailAndPasswordInput};
