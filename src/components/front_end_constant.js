
const CONST_LOG_IN_DELAY_MS = 550;

const CONST_PATH = {
    landing : '/',
    signInUp : '/signinup',
    home : '/home',
    boardpage: '/boardpage',
    workspace: '/workspace',
    gameSnake:'/game/snake',
    lounge: '/lounge',
    loungeNews: '/lounge/news',
    userProfile: '/userprofile'};

// The constant to be used for whole project
const SERVER_PORT = 5500;
const SERVER_URL = import.meta.env.VITE_DEPLOYED_SERVER_DOMAIN || `http://localhost:${SERVER_PORT}`;
const API_USER_URL = '/api/simplework/v0/users';

// Current not yet deployed, set as '' first
const DEPLOYED_URL = '';

//const HOME_URL = DEPLOYED_URL ? `${DEPLOYED_URL}/${CONST_PATH.home}` : CONST_PATH.home; // '/home'
const LANDING_URL = DEPLOYED_URL ? `${DEPLOYED_URL}${CONST_PATH.landing}` : CONST_PATH.landing; // '/landing'

export {
    API_USER_URL, CONST_LOG_IN_DELAY_MS, CONST_PATH, LANDING_URL,
    SERVER_URL
};
