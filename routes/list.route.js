import express from "express";
import {
  archiveList,
  createList,
  deleteList,
  getLists,
  reorderLists,
} from "../controllers/list.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/list/:boardId", authenticateJWT, createList); //w
router.get("/lists/:boardId", authenticateJWT, getLists); //w
router.patch("/list/archive/:listId", authenticateJWT, archiveList); //w
router.patch("/list/reorder/:boardId", authenticateJWT, reorderLists); //w
router.delete("/list/:listId", authenticateJWT, deleteList);

export default router;
