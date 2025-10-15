import express from "express";

import {
  createWorkspace,
  inviteMembersToWorkspaceById,
  inviteMembersToWorkspaceByMail,
  acceptWorkspaceInvite,
  rejectWorkspaceInvite,
  getWorkspaces,
  getWorkspaceById,
} from "../controllers/workspace.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/workspace", authenticateJWT, createWorkspace); //w
router.get("/workspaces", authenticateJWT, getWorkspaces);
router.get("/workspaces/:workspaceId", authenticateJWT, getWorkspaceById);
router.post(
  "/workspace/invite-id",
  authenticateJWT,
  inviteMembersToWorkspaceById
);
router.post(
  "/workspace/invite",
  authenticateJWT,
  inviteMembersToWorkspaceByMail
);
router.post("/workspace/accept-invite/:token", acceptWorkspaceInvite);
router.get("/workspace/reject-invite/:token", rejectWorkspaceInvite);

export default router;
