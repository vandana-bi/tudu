import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Board from "../models/board.model.js";
import User from "../models/user.model.js";
import {
  createBoardService,
  deleteBoardService,
  getBoardService,
  getBoardsService,
  inviteByIdService,
} from "../services/board.service.js";

const INVITE_SECRET = process.env.INVITE_SECRET || "supersecret";

export const createBoard = async (req, res) => {
  try {
    const { title, workspaceId } = req.body;

    const board = await createBoardService(req.user, {
      title,
      workspaceId,
      admin: req.user.id,
    });
    res.status(201).json({ message: "Board Created Successfully!!", board });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Board Could Not Be Created!!", error: err.message });
  }
};

export const getBoards = async (req, res) => {
  try {
    const boards = await getBoardsService(req.user);
    res.status(200).json({ message: "Board Fetched Successfully!", boards });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const getBoardById = async (req, res) => {
  try {
    const board = await getBoardService(req.user, req.params.boardId);
    res.status(200).json({ message: "Board Fetched Successfully!", board });
  } catch (err) {
    res
      .status(403)
      .json({ message: "Error getting board by id.", error: err.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    await deleteBoardService(req.user, req.params.boardId);
    return res.status(201).json({
      message: "Board Deleted Succesfully!!",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Board Could Not Be Deleted!!",
    });
  }
};

export const switchBoardVisibility = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { visibility } = req.body;

    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) return res.status(404).json({ message: "Board not found" });

    if (!canManageBoard(req.user, board, board.workspaceId)) {
      return res
        .status(403)
        .json({ message: "Forbidden: only admins can switch visibility" });
    }

    board.visibility = visibility;
    await board.save();

    return res
      .status(200)
      .json({ message: `Visibility set to ${visibility}`, board });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update visibility", error: err.message });
  }
};

export const inviteMembersToBoardById = async (req, res) => {
  try {
    const board = await inviteByIdService(req.body);
    return res.status(200).json({
      message: "Member invited successfully",
      board,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while inviting member",
      error: err.message,
    });
  }
};

export const inviteMembersToBoardByMail = async (req, res) => {
  try {
    const results = inviteByMailService(req.body);
    res.status(200).json({ message: "Board invitations processed.", results });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Invitation could not be sent!" });
  }
};

export const acceptBoardInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let payload;
    try {
      payload = jwt.verify(token, INVITE_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invite link." });
    }
    const { boardId, email } = payload;
    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found." });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: "Member",
      });
      await user.save();
    }
    const alreadyMember = board.members.find(
      (m) => m && m.toString() === user._id.toString()
    );
    if (!alreadyMember) {
      board.members.push(user._id);
      await board.save();
    }
    res.status(200).json({
      message: "Registration successful and invite accepted!",
      board,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong!!! Invite Could Not Be Accepted.",
      error: err.message,
    });
  }
};

export const rejectBoardInvite = async (req, res) => {
  try {
    const { token } = req.params;
    try {
      jwt.verify(token, INVITE_SECRET);
    } catch (err) {
      return res
        .status(400)
        .json({ message: "Invalid or expired invite link." });
    }
    return res.status(200).json({
      message: "Invite rejected. You won't be added to this board!",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong!!! Invite Rejection Failed." });
  }
};
