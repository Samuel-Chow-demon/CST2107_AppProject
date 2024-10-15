
// 1 - Define the const
import {SERVER_PORT,
        API_USER_URL, MONGODB_API} from './back_end_constant.js';

// 2 - Retreive the node modules
import express    from 'express';
import mongoose   from 'mongoose';
import userRoutes from './routes/userRoute.js';
import cors       from 'cors';

const server            = express();

// 3 - Connect to Database
mongoose
  .connect(MONGODB_API)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log(`Error connecting to the database: ${error}`);
  });

// 4 - Configure the app uses
// Configure express use json format
// Configure Allow the FrontEnd And Backend Share Resources
server.use(express.json());
server.use(cors());

// 5 - Develop the API
server.use(`${API_USER_URL}`, userRoutes);         // Log In Process

// 6 -  Allow Frontend to retrieve the backend config

// 6 - Start Server
server.listen(SERVER_PORT, ()=>{
    console.log(`Server Running at Port : ${SERVER_PORT}`);
});