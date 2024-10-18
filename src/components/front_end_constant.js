const CONST_LOG_IN_DELAY_MS = 550;

const CONST_PATH = {
    landing : '/',
    signInUp : '/signinup',
    home : '/home'
}

// The constant to be used for whole project
const SERVER_PORT = 5500;
const SERVER_URL = import.meta.env.VITE_DEPLOYED_SERVER_DOMAIN || `http://localhost:${SERVER_PORT}`;
const API_USER_URL = '/api/simplework/v0/users';

// Current not yet deployed, set as '' first
const DEPLOYED_URL = '';

//const HOME_URL = DEPLOYED_URL ? `${DEPLOYED_URL}/${CONST_PATH.home}` : CONST_PATH.home; // '/home'
const LANDING_URL = DEPLOYED_URL ? `${DEPLOYED_URL}${CONST_PATH.landing}` : CONST_PATH.landing; // '/landing'

export {CONST_PATH, CONST_LOG_IN_DELAY_MS,
        LANDING_URL,
        SERVER_URL, API_USER_URL};