import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // password: { type: String, required: true},
  password: { type: String, default: ""},
  verifyOtp: { type: String, default: "" },
  verifyOtpExpireAt: { type: Number, default: 0 },
  isAccountVerified: { type: Boolean, default: false },
  resetOtp: { type: String, default: "" },
  resetOtpExpireAt: { type: Number, default: 0  },
  authProvider: { type: String, enum: ['google', 'facebook', 'form'], required: true, default: 'form' },
  providerId: String
});

const userModel = mongoose.model.user || mongoose.model('User', UserSchema);

export default userModel; 

