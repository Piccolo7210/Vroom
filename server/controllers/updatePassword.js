import Driver from '../models/Driver.js';
import Customer from '../models/Customer.js';
import bcrypt from 'bcryptjs';
import { sendOTP } from '../services/emailService.js';

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  const { role, email } = req.body;

  let user;
  if (role === "Driver") user = await Driver.findOne({ email });
  else if (role === "Customer") user = await Customer.findOne({ email });

  if (!user) return res.status(404).json({ error: "Invalid email" });

  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    await sendOTP(email, otp);
    res.json({ message: "OTP sent", otp });
  } catch (error) {
    res.status(500).json({ error: "Error sending email" });
  }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
  const { role, email, newPassword } = req.body;

  let user;
  if (role === "Driver") user = await Driver.findOne({ email });
  else if (role === "Customer") user = await Customer.findOne({ email });

  if (!user) return res.status(404).json({ error: "User not found" });

 const salt = await bcrypt.genSalt(10);
 const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: "Password updated" });
};