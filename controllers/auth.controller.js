import mongoose from "mongoose";

import {
  loginUser,
  createUser,
  getMeService,
  generateToken,
  generateRefreshToken,
  resetPasswordService,
  forgotPasswordService,
} from "../services/auth.services.js";
import { setTokenCookie } from "../utils/cookie.helper.js";
import { createWorkspaceService } from "../services/workspace.service.js";
import { sendSignupNotification } from "../utils/notification.helper.js";

export const signup = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = await createUser(req.body);
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    const cookie = setTokenCookie(res, token);
    const workspace = await createWorkspaceService(req.user, {
      title: `${user.name}'s First Workspace`,
      admin: user._id,
    });
    if (!workspace) {
      return res
        .status(401)
        .json({ message: "No Workspace Created While Signing Up!" });
    }
    const notification = await sendSignupNotification(user);
    if (!notification) {
      return res.status(400).json({
        message: "Notification not sent for sign up!!",
      });
    }
    session.commitTransaction();
    session.endSession();
    return res.status(201).json({
      message: "User Created Successfully!!!",
      user,
      token,
      refreshToken,
      workspace,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(500).json({ message: "User Signup Failed!", error: err });
  }
};

export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body);
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    const cookie = setTokenCookie(res, token);
    return res.status(200).json({
      message: "User logged in successfully!",
      user,
      token,
      refreshToken,
      cookie,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "User Login Failed!!", error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    await forgotPasswordService(req.body.email);
    res.status(200).json({
      message: "Password reset link sent to your email!",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error in forgot password api!!",
      error: err.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;
    resetPasswordService(token, newPassword);
    return res.status(200).json({
      message: "Password changed successfully!!",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset link has expired!" });
    }
    res.status(500).json({
      message: "Error while resetting password!!",
      error: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getMeService(userId);
    res.json({ user });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error in getting current logged in User!" });
  }
};
