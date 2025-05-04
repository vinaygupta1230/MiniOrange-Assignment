// const User = require('../models/User');
// const { hashPassword, comparePassword } = require('../utils/hash');
// const { createToken } = require('../utils/jwt');

// exports.register = async (req, res) => {
//   const { email, password, name } = req.body;
//   const existing = await User.findOne({ email });
//   if (existing) return res.status(400).json({ error: 'User already exists' });

//   const hashed = await hashPassword(password);
//   const user = await User.create({ email, password: hashed, name });
//   const token = createToken(user);
//   res.json({ token });
// };

// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user) return res.status(404).json({ error: 'User not found' });

//   const match = await comparePassword(password, user.password);
//   if (!match) return res.status(401).json({ error: 'Invalid password' });

//   const token = createToken(user);
//   res.json({ token });
// };


import bcrypt from 'bcryptjs';
import { json } from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/UserModel.js';
import transporter from '../config/nodemailer.js';
import axios from 'axios';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export const register = async (req, res)=>{
  const {name, email, password} = req.body;

  if(!name || !email || !password){
    return res.json({success: false, message: "Missing details"});
  }

  try {
    const existingUser = await userModel.findOne({email});
    console.log("hiii1");
    if(existingUser){
      return res.json({success: false, message: "User Already Exist"});
    }
    console.log("hiii2");
    
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("hiii3");
    
    const user = new userModel({name, email, password:hashedPassword});
    console.log("hiii4");
    await user.save();
    console.log("hiii5");
    
    
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});
    console.log("hiii6");
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      samesite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    console.log("hiii7");


    // Sending welcome email

    // Define email options
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // sender address
      to: email, // recipient address
      subject: 'Test Email', // subject line
      text: `Your account has been created with email ${email}!`, // plain text body
      html: '<p>This is a <strong>test email</strong> from your personal project!</p>' // HTML body (optional)
    };

    console.log("Hiii8");
    
    // Send the email
    await transporter.sendMail(mailOptions);
    
    console.log("Hiii9");
    // await transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //       console.log('Error occurred:', error);
    //   } else {
    //       console.log('Email sent successfully:', info.response);
    //   }
    // });

    return res.json({success: true});

  } catch (error) {
    res.json({success: false, message: error.message});
  }
}


export const login = async (req, res) =>{
  const {email, password} = req.body;

  if(!email || !password){
    return res.json({success: false, message: "Email and Password are required"});
  }

  try {
    const user = await userModel.findOne({email});

    if(!user){
      return res.json({success: false, message: "Invalid Email"});
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if(!isMatched){
      return res.json({success: false, message: "Invalid Password"});
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '7d'});

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      samesite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({success: true});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}


export const logout = async(req, res) =>{
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      samesite: process.env.NODE_ENV === "production" ? 'none' : 'strict'
    })
    return res.json({success: true, message: "Logged Out"});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}


export const sendVerifyOtp = async(req, res) =>{
  try {
    const {userid} = req.body;
    const user = await userModel.findById(userid);

    console.log("Hiii1");
    
    if(user.isAccountVerified){
      return res.json({success: false, message: "Account already verified"});
    }
    console.log("Hiii2");
    
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24*60*60*1000;
    
    console.log("Hiii3");
    await user.save();
    console.log("Hiii4");
    
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // sender address
      to: user.email, // recipient address
      subject: 'Account verification OTP', // subject line
      text: `Your OTP is ${otp}!`, // plain text body
      // html: '<p>This is a <strong>test email</strong> from your personal project!</p>' // HTML body (optional)
    };
    console.log("Hiii5");
    
    await transporter.sendMail(mailOptions);
    console.log("Hiii6");
    res.json({success: true, message: "OTP sent Successfully"});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}

export const verifyEmail = async (req, res) =>{
  const {userid, otp} = req.body;
  
  if(!userid || !otp){
    return res.json({success: false, message:" Missing details"});
  }
  
  try {
    const user = await userModel.findById(userid);
    
    if(!user){
      return res.json({success: false, message:"User not found"});
    }
    
    if(user.verifyOtp === '' || user.verifyOtp !== otp){
      return res.json({success: false, message:"Invalid otp"});
    }
    
    if(user.verifyOtpExpireAt < Date.now()) {
      return res.json({success: false, message:"otp expired"});
    }
    
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    
    await user.save();
    res.json({success: true, message: "Account Verified"});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
}


export const isAuthenticated = async(req, res)=>{
  try {
    return res.json({success: true});
  } catch (error) {
    res.json({success: false, message: error.message});
  }
} 



// google auth code
export const getGoogleAuthURL = (req, res) => {
  const redirectUri = 'http://localhost:4000/api/auth/google/callback';
  const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}`;
  res.json({ url: authUrl });
};


export const googleCallback = async (req, res) => {
  const { code } = req.query;
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: 'http://localhost:4000/api/auth/google/callback',
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data;

    // Fetch user info
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { sub: providerId, email, name } = userInfo.data;

    // Check if user exists or create new
    let user = await userModel.findOne({ email });
    if (!user) {
      user = new userModel({
        email,
        name,
        authProvider: 'google',
        providerId,
        isAccountVerified: 'true'
      });
      await user.save();
    }

    // Issue JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    // res.json({ token });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      samesite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({success: true});
  } catch (error) {
    console.error('Google OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};


// facebook auth code

export const getFacebookAuthURL = async(req, res) =>{
  const redirectUri = 'http://localhost:4000/api/auth/facebook/callback';
  const scope = 'email,public_profile';
  const authUrl = `https://www.facebook.com/v12.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
  res.json({ url: authUrl });
}


export const facebookCallback = async (req, res) => {
  console.log("Hiii1");
  const { code } = req.query;
  console.log("Hiii2");
  try {
    // Exchange code for access token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v12.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}&redirect_uri=${encodeURIComponent('http://localhost:4000/api/auth/facebook/callback')}`);
    console.log("Hiii3");
    
    const { access_token } = tokenResponse.data;
    console.log("Hiii4");
    
    // Fetch user info
    const userInfo = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${access_token}`);
    console.log("Hiii5");
    
    console.log(userInfo);
    
    console.log("Hiii6");
    const { id: providerId, email, name } = userInfo.data;
    console.log("Hiii7");
    
    // Check if user exists or create new
    let user = await userModel.findOne({ email });
    console.log("Hiii8");
    if (!user) {
      user = new userModel({
        email,
        name,
        authProvider: 'facebook',
        providerId,
        isAuthenticated: 'true'
      });
      console.log("user");
      console.log(user);
      await user.save();
    }

    // Issue JWT
    const token = jwt.sign({ id: user._id}, JWT_SECRET, { expiresIn: '7d' });
    // res.json({ token });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      samesite: process.env.NODE_ENV === "production" ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.json({success: true});
  } catch (error) {
    console.error('Facebook OAuth error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
};