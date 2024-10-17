// 0 - Use the .env File
import dotnev from 'dotenv';
dotnev.config();

// The constant to be used for whole project
const SERVER_PORT = 5500;
const API_USER_URL = '/api/simplework/v0/users';

// Database API
const MONGODB_API = process.env.MONGODB_SIMPLEWORK_APP_URL;

// FLAG IF DEPLOYED, change the flag before deploy to cloud services
const IS_SERVER_DEPLOYED = false;

export {
    SERVER_PORT,
    API_USER_URL,
    MONGODB_API,
    IS_SERVER_DEPLOYED
}