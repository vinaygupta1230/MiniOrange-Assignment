import express from 'express';
import { getUserData, UpdateUserData } from '../controllers/userController.js';
import userAuth from '../middleware/userAuth.js';


const userRoute = express.Router();
userRoute.get('/data', userAuth, getUserData);

userRoute.patch('/update-data', userAuth, UpdateUserData);

export default userRoute;