import Board from "../models/board.model.js";
import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import { canAccessBoard, canManageBoard } from "./rbac.service.js";

export const createBoardService = async (user, data) => {
  const { workspaceId } = data;
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  const board = new Board({
    ...data,
    admin: data.admin,
    members: [data.admin],
    workspaceId,
  });
  await board.save();
  return board;
};

export const getBoardsService = async (user) => {
  const boards = await Board.find().populate("workspaceId");
  return boards.filter((board) => canAccessBoard(user, board));
};

export const getBoardService = async (user, boardId) => {
  const board = await Board.findById(boardId).populate("workspaceId");
  if (!board) throw new Error("Board not found");

  if (!canAccessBoard(user, board)) {
    throw new Error("Forbidden: no access to this board");
  }
  return board;
};

export const deleteBoardService = async (user, boardId) => {
  const board = await Board.findById(boardId).populate("workspaceId");
  if (!board) throw new Error("Board not found");

  if (!canManageBoard(user, board, board.workspaceId)) {
    throw new Error("Forbidden: only board/workspace admin can delete");
  }

  await board.deleteOne();
  return { message: "Board deleted" };
};

export const inviteByIdService = async (data) => {
  const { userId, boardId } = data;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const board = await Board.findById(boardId);
  if (!board) {
    return res.status(404).json({ message: "Board not found" });
  }

  const boardOwner = board.admin.toString();

  if (board.members.includes(userId)) {
    return res.status(400).json({ message: "User is already a member" });
  }

  if (boardOwner === userId) {
    return res.status(400).json({
      message: "Board Owner Can't be a Member!!",
    });
  }

  board.members.push(userId);
  await board.save();
};

export const inviteByMailService = async (data) => {
  const { boardId, emails } = data;
  if (!boardId || !emails) {
    return res
      .status(400)
      .json({ message: "Board ID and emails are required." });
  }
  const username = req.user.name;
  const results = [];
  for (const email of emails) {
    const token = jwt.sign({ boardId, email }, INVITE_SECRET, {
      expiresIn: "15m",
    });
    const acceptLink = `http://localhost:4040/api/board/accept-invite/${token}`;
    const rejectLink = `http://localhost:4040/api/board/reject-invite/${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #2196F3;">Board Invitation</h2>
          <p>You have been invited by<strong> ${username} </strong>to join a board.</p>
          <p>Click <a href="${acceptLink}">here</a> to accept the invite.</p>
          <p>Or <a href="${rejectLink}">reject</a> this invitation.</p>
          <hr />
          <small>This is an automated message. Please do not reply directly.</small>
        </div>
      `;
    try {
      await sendMail({
        to: email,
        subject: "Board Invitation",
        text: "You have been invited to join a board.",
        html,
      });
      results.push({ email, status: "sent" });
    } catch (err) {
      results.push({ email, status: "failed", error: err.message });
    }
  }
};
