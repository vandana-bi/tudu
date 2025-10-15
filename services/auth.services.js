import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { sendMail } from "../utils/mailer.js";

dotenv.config();

export const createUser = (data) => {
  const { name, email, password } = data;
  if (!name || !email || !password) {
    throw new Error("Enter all fields!");
  }
  const existingUser = User.findOne({ email });
  if (existingUser) throw new Error("User already exists!");
  const hashedPassword = bcrypt.hash(password, 10);
  const user = User.create({
    name,
    email,
    password: hashedPassword,
    role: "User",
  });
  return user;
};

export const loginUser = (data) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new Error("Missing some field, enter all fields!");
  }
  const user = User.findOne({ email });
  if (!user) throw new Error("No user exists with the email!");
  const isMatch = bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials!");
  return user;
};

export const forgotPasswordService = (email) => {
  if (!email) {
    return res.status(400).json({
      message: "Please enter email!!",
    });
  }

  const user = User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      message: "No user found with this email!!",
    });
  }

  const resetPasswordToken = generateResetPasswordToken(user);

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;

  sendMail({
    to: user.email,
    subject: "Reset your Tudu password",
    html: `
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click below to proceed:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>This link is valid for 15 minutes. If you didn't request this, ignore this email.</p>
      `,
  });
};

export const resetPasswordService = (token, newPassword) => {
  if (!token) {
    throw new Error("Token not given!");
  }
  if (!newPassword) {
    throw new Error("New Password not provided!");
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = User.findById(decoded.id);
  if (!user) {
    throw new Error("User not found!");
  }
  const hashedPassword = bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.save;
};

export const getMeService = (userId) => {
  const user = User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not Found!!");
  }
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      workspaces: user.workspaces || [],
      boards: user.boards || [],
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.EXPIRES_IN,
    }
  );
};

export const generateRefreshToken = (user) => {
  if (!user) {
    throw new Error("User not found!");
  }
  const refreshToken = jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      workspaces: user.workspaces || [],
      boards: user.boards || [],
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
  return refreshToken;
};

export const generateResetPasswordToken = (user) => {
  if (!user) {
    throw new Error("User not found!");
  }
  const resetPasswordToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      workspaces: user.workspaces || [],
      boards: user.boards || [],
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  return resetPasswordToken;
};
