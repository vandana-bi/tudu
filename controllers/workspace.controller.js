import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import {
  createWorkspaceService,
  deleteWorkspaceService,
  getWorkspaceService,
  getWorkspacesService,
  updateWorkspaceService,
} from "../services/workspace.service.js";
import { sendMail } from "../utils/mailer.js";

const INVITE_SECRET = process.env.INVITE_SECRET || "supersecret";

export const createWorkspace = async (req, res) => {
  try {
    const workspace = await createWorkspaceService(req.user, req.body);
    res
      .status(201)
      .json({ message: "WorkSpace created succesfully!!!", workspace });
  } catch (err) {
    res.status(500).json({
      message: "Error while creating workspace!!",
      error: err.message,
    });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const workspaces = await getWorkspacesService(
      req.user,
      req.params.workspaceId
    );
    res.status(200).json({ message: "Workspaces Found!!", workspaces });
  } catch (err) {
    res.status(500).json({ message: "Workspaces Not Found!!" });
  }
};

export const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await getWorkspaceService(
      req.user,
      req.params.workspaceId
    );
    res.status(200).json({ message: "Workspace fetched!!", workspace });
  } catch (err) {
    res
      .status(403)
      .json({ message: "Error fetching all workspaces!", error: err.message });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const workspace = await updateWorkspaceService(
      req.user,
      req.params.workspaceId,
      req.body
    );
    res
      .status(200)
      .json({ message: "Workspace updated successfully!!", workspace });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    await deleteWorkspaceService(req.user, req.params.workspaceId);
    return res.status(201).json({
      message: "Workspace Deleted Successfully!!",
    });
  } catch (err) {
    res
      .status(403)
      .json({ message: "Error deleting workspace!!!", error: err.message });
  }
};

export const switchWorkspaceVisibility = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { visibility } = req.body;

    const workspace = await workspaceVisibilityService(workspaceId, visibility);

    return res.status(200).json({
      message: `Visibility Updated to ${visibility} Successfully!!`,
      workspace,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Visibilty Switch Failed!! ",
      error: err.message,
    });
  }
};

export const inviteMembersToWorkspaceById = async (req, res) => {
  try {
    const { userId, workspaceId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member" });
    }

    workspace.members.push(userId);
    await workspace.save();

    return res.status(200).json({
      message: "Member invited and added to members successfully",
      workspace,
    });
  } catch (error) {
    console.error("Error inviting member:", req.user.id);
    return res
      .status(500)
      .json({ message: "Server error while inviting member" });
  }
};

export const inviteMembersToWorkspaceByMail = async (req, res) => {
  try {
    const { workspaceId, emails } = req.body;
    if (!workspaceId || !emails) {
      return res
        .status(400)
        .json({ message: "Workspace ID and emails are required." });
    }

    const username = req.user.name;
    const results = [];

    for (const email of emails) {
      const token = jwt.sign({ workspaceId, email }, INVITE_SECRET, {
        expiresIn: "15m",
      });

      const acceptLink = `http://localhost:4040/api/workspace/accept-invite/${token}`;
      const rejectLink = `http://localhost:4040/api/workspace/reject-invite/${token}`;

      const html = `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #4CAF50;">Workspace Invitation</h2>
          <p>You have been invited by<strong> ${username} </strong>to join a workspace.</p>
          <p>Click <a href="${acceptLink}">here</a> to accept the invite.</p>
          <p>Or <a href="${rejectLink}">reject</a> this invitation.</p>
          <hr />
          <small>This is an automated message. Please do not reply directly.</small>
        </div>
      `;

      try {
        await sendMail({
          to: email,
          subject: "Workspace Invitation",
          text: "You have been invited to join a workspace.",
          html,
        });
        results.push({ email, status: "sent" });
      } catch (err) {
        results.push({ email, status: "failed", error: err.message });
      }
    }

    res.status(200).json({ message: "Invitations processed.", results });
  } catch (err) {
    res.status(500).json({ message: "Invitation could not be sent!" });
  }
};

export const acceptWorkspaceInvite = async (req, res) => {
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

    const { workspaceId, email } = payload;

    if (!email || !name || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found." });
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

    const alreadyMember = workspace.members.some(
      (m) => m?.toString() === user._id.toString()
    );

    if (alreadyMember) {
      res.status(208).json({
        message: `You Are Already a Member in ${workspace.title} Workspace`,
      });
    }

    if (!alreadyMember) {
      workspace.members.push(user._id);
      await workspace.save();
    }

    res.status(200).json({
      message: "Registration successful and invite accepted!",
      workspace,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const rejectWorkspaceInvite = async (req, res) => {
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
      message: "Invite rejected. You won’t be added to this workspace.",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
