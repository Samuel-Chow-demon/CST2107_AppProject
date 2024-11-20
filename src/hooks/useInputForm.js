import { useState, useEffect } from 'react';
import { passwordBoxIcon } from '../components/Input.jsx';

// Current Form Input
// {
//     email,
//     password,
//     passwordConfirm,
//     username
// }
const useInputForm = (initFormData) => {

    const [formData, setFormData] = useState(initFormData);

    const [confirmPasswordIcon, setConfirmIconType] = useState(passwordBoxIcon.none);

    const [showPassword, setShowPassword] = useState(false);
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const resetFormData = () => setFormData(initFormData);

    const [isDisableInput, setDisableInput] = useState(false);

    const formInputErrorInit = {
        email: {
            'isError' : false,
            'message' : ''
        },
        password: {
            'isError' : false,
            'message' : ''
        },
        passwordConfirm: {
            'isError' : false,
            'message' : ''
        },
        username: {
            'isError' : false,
            'message' : ''
        }
    }

    const [formInputErrors, setFormInputErrors] = useState(formInputErrorInit);

    const setError = (field, isError, message) => {
        setFormInputErrors((prevErrors) => ({
            ...prevErrors,
            [`${field}`]: {'isError' : isError, 'message' : message}
        }));
    };

    const enterInput = (field) => (event) => {

        setError(field, false, "");

        setFormData((prevFormData) => ({
            ...prevFormData,
            [`${field}`]: event.target.value
        }));
    };

    // Effect on checking confirm password
    useEffect(() =>{

        if (formData?.password?.length <= 0 ||
            formInputErrors.password.isError)
        {
            setFormData((prevFormData) => ({
                ...prevFormData,
                passwordConfirm: ''
            }));
        }

        if (formData?.passwordConfirm?.length <= 0 ||
            formInputErrors.password.isError)
        {
            setConfirmIconType(passwordBoxIcon.none);
        }
        else if (formData?.password?.length > 0 &&
                formData.passwordConfirm === formData.password)
        {
            setConfirmIconType(passwordBoxIcon.correctIcon);
        }
        else
        {
            setConfirmIconType(passwordBoxIcon.wrongIcon);
        }

    }, [formData.passwordConfirm, formData.password, formInputErrors.password.isError]);

    function validateFieldInput ({byPassPSChk = false, byPassPSConfirm = false}) 
    {
        const PASSWORD_MIN_LENGTH = 6;

        let isError = false;
        
        // Check the Email must be chars + @ + chars + . + chars
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) 
        {
            setError('email', true, 'Please enter a valid email.');
            isError = true;
        } 

        // At least have one Upper case
        // one special character except space
        // one number
        let passwordError = '';
        const passwordPolicy1 = /^(?=.*[A-Z]).*$/;
        const passwordPolicy2 = /^(?=.*[0-9]).*$/;
        const passwordPolicy3 = /^(?=.*[^a-zA-Z0-9]).*$/;

        if (!byPassPSChk)
        {
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
        }

        if (passwordError)
        {
            setError('password', true, passwordError);
            isError = true;
        }
        
        if (!formData.username)
        {
            setError('username', true, 'Username cannot be empty');
            isError = true;
        }

        if (formData.oldPassword != null && // if the form need to have oldPassword
            formData.oldPassword.length <= 0)
        {
            setError('oldPassword', true, 'Please Enter Current Password To Proceed Changes');
            isError = true;
        }

        // Check if the password and passwordConfirm match
        // only check if the formdata has passwordConfirm object
        if (!byPassPSChk && !byPassPSConfirm &&
            'passwordConfirm' in formData &&    
            formData.password != formData.passwordConfirm)
        {
            setError('passwordConfirm', true, 'Confirm Password Not Matched');
            isError = true;
        }
        

        return !isError;
    }


    function validateInput({byPassPasswordCheck = false, byPassPasswordConfirm = false}) 
    {
        setFormInputErrors(formInputErrorInit);
    
        return validateFieldInput({byPassPSChk : byPassPasswordCheck, byPassPSConfirm : byPassPasswordConfirm});
    }

    return {
        formData, setFormData, resetFormData,
        enterInput,
        confirmPasswordIcon,
        showPassword, handleClickShowPassword,
        isDisableInput, setDisableInput,
        formInputErrors,
        validateInput
    };
};

export default useInputForm;