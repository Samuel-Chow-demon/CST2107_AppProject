
import {DEPLOYED_HOME_URL} from '../src/components/front_end_constant.js'

// The constant to be used for whole project
const SERVER_PORT = 5500;
const SERVER_URL = DEPLOYED_HOME_URL || `http://localhost:${SERVER_PORT}`;

const API_USER_URL = '/api/simplework/v0/users';

export {
    SERVER_PORT,
    SERVER_URL,
    API_USER_URL
}