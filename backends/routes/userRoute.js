
import express    from 'express';
const Router = express.Router();
import userController from '../controllers/userController.js';

// ------------------------- POST 
// Sign up API
//Router.post('/register', userController.RegisterUser);;

// Login API
//Router.post('/login', userController.UserLogIn);

// Login request Token API
Router.post('/login/token', userController.LogInUserToken);

// Modify User Info By ID
//Router.post('/account', userController.ModifyUserInfoByID);

// -------------------------- GET
// Get All Users API
//Router.get('/all', userController.GetAllUsers);

// Get Particular User API
//Router.get('/:id', userController.GetUserByID);

export default Router;