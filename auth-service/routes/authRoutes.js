// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// router.post('/register', authController.register);
// router.post('/login', authController.login);

// // TODO: Add `/auth/google` and `/auth/facebook`

// module.exports = router;

import express from 'express';
import { facebookCallback, getFacebookAuthURL, getGoogleAuthURL, googleCallback, isAuthenticated, login, logout, register, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRoute = express.Router();
authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.post('/logOut', logout);
authRoute.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRoute.post('/verify-account', userAuth, verifyEmail);
authRoute.post('/is-authenticated', userAuth, isAuthenticated);
authRoute.get('/google', getGoogleAuthURL);
authRoute.get('/google/callback', googleCallback);
authRoute.get('/facebook', getFacebookAuthURL);
authRoute.get('/facebook/callback', facebookCallback);

export default authRoute;