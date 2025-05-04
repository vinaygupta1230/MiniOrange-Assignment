import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js'
import userRoute from './routes/userRoutes.js';
// const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials : true}))
// app.use('/auth', authRoutes);

app.get('/', (req, res) => res.send("API working "));
app.use('/api/auth', authRouter);
app.use('/api/user', userRoute);

// mongoose.connect(process.env.MONGO_URI || "", () => {
//   console.log('Connected to MongoDB');
//   // app.listen(port, () => console.log(`Auth service on port ${port}`));
// });
app.listen(port, () => console.log(`Auth service on port ${port}`));
