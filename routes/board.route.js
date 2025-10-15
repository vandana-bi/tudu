import express from "express";

import {
  createBoard,
  getBoards,
  inviteMembersToBoardById,
  inviteMembersToBoardByMail,
  acceptBoardInvite,
  rejectBoardInvite,
  switchBoardVisibility,
  getBoardById,
  deleteBoard,
} from "../controllers/board.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/board", authenticateJWT, createBoard); //w
router.get("/boards", authenticateJWT, getBoards); //w
router.get("/board/:boardId", authenticateJWT, getBoardById); //w
router.delete("/board/:boardId", authenticateJWT, deleteBoard);
router.patch(
  "/board/visibility/:boardId",
  authenticateJWT,
  switchBoardVisibility //
);
router.post("/board/invite-id", authenticateJWT, inviteMembersToBoardById); //w
router.post("/board/invite", authenticateJWT, inviteMembersToBoardByMail); //
router.post("/board/accept-invite/:token", acceptBoardInvite);
router.get("/board/reject-invite/:token", rejectBoardInvite);

export default router;
