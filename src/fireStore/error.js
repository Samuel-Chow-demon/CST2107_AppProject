import { AuthErrorCodes } from "firebase/auth"

export const getErrorCode = (code) => {
    switch(code) {
        case AuthErrorCodes.INVALID_PASSWORD:
            return "Password Not Matched";
        case AuthErrorCodes.EMAIL_EXISTS:
            return "User Already Existed";
        case AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE:
            return "Credential Already In Use";
        case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
            return "Invalid Credentials";
        case AuthErrorCodes.INVALID_EMAIL:
            return "Please Provide A Correct Email";
        default:
            return `Error Occurred, Code : ${code}`;
    }
}