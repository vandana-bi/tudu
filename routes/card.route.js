import express from "express";
import {
  assignMember,
  createCard,
  uploadAttachment,
  getCardById,
  moveCardAcrossLists,
} from "../controllers/card.controller.js";
import {
  addComment,
  deleteComment,
  editComment,
} from "../controllers/comment.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/card/:listId", authenticateJWT, createCard); //w
router.patch("/card/:cardId", authenticateJWT, assignMember); //w
router.get("/card/:cardId", authenticateJWT, getCardById); //w
router.patch("/card/:cardId", authenticateJWT, moveCardAcrossLists); //w
router.patch(
  "/card/:cardId/attachments",
  upload.single("file"),
  uploadAttachment
); //w

router.post("/card/:cardId/comment", authenticateJWT, addComment); //w
router.patch("/card/comment/:commentId", authenticateJWT, editComment); //w
router.delete("/card/comment/:commentId", authenticateJWT, deleteComment); //w

export default router;
