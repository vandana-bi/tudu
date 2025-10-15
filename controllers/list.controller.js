import {
  createListService,
  deleteListService,
} from "../services/list.service.js";
import { canManageBoard, canAccessBoard } from "../services/rbac.service.js";
import List from "../models/list.model.js";
import Board from "../models/board.model.js";

export const createList = async (req, res) => {
  try {
    const { boardId } = req.params;

    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!canManageBoard(req.user, board, board.workspaceId)) {
      return res.status(403).json({
        message: "Not authorized to create list in this board",
      });
    }

    const list = await createListService(req.user, req.body);

    if (!list) {
      return res.status(400).json({
        message: "List not created!!",
      });
    }

    list.boardId = boardId;
    await list.save();

    res.status(200).json({
      message: "List created successfully!!",
      list,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error while creating list!!",
      error: err.message,
    });
  }
};

export const getLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }
    if (!canAccessBoard(req.user, board)) {
      return res.status(403).json({ message: "Not authorized to view lists" });
    }

    const lists = await List.find({ boardId });

    if (!lists) {
      return res.status(400).json({
        message: "Lists not fetched!!",
      });
    }
    return res.status(200).json({
      message: "Lists fetched successfully!!",
      lists,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting lists!!",
    });
  }
};

export const archiveList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { isArchived } = req.body;

    if (!listId || !isArchived) {
      return res.status(400).json({
        message:
          "Values are missing, please enter both fields to archive list!!",
      });
    }

    const list = await List.findById(listId).populate("boardId");
    if (!list) {
      return res.status(404).json({ message: "List not found!!" });
    }

    const board = await Board.findById(list.boardId).populate("workspaceId");

    if (!canManageBoard(req.user, board, board.workspaceId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to archive list" });
    }

    if (list.isArchived === isArchived) {
      return res.status(400).json({
        message: `isArchive field is already ${isArchived}!!`,
      });
    }

    list.isArchived = isArchived;
    await list.save();

    return res.status(200).json({
      message: "List archived succesfully!!!",
      list,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error while archiving list!!",
    });
  }
};

export const renameList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    const list = await List.findById(listId).populate("boardId");

    if (!list) {
      return res.status(404).json({ message: "List not found!!!" });
    }

    const board = await Board.findById(list.boardId).populate("workspaceId");

    if (!canManageBoard(req.user, board, board.workspaceId)) {
      return res.status(403).json({ message: "Not authorized to rename list" });
    }

    if (list.title === title) {
      return res.status(400).json({
        message: `Title is already ${title}, please enter a new title.`,
      });
    }

    list.title = title;
    await list.save();

    return res.status(200).json({
      message: "List title updated successfully!!",
      list,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error while renaming the list!!",
    });
  }
};

export const reorderLists = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { listId, newPosition } = req.body;

    if (!listId || typeof newPosition !== "number") {
      return res
        .status(400)
        .json({ message: "listId and newPosition are required" });
    }

    const board = await Board.findById(boardId).populate("workspaceId");
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    if (!canManageBoard(req.user, board, board.workspaceId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to reorder lists in this board" });
    }

    const lists = await List.find({ boardId }).sort("position");

    const listToMove = lists.find((l) => l._id.toString() === listId);
    if (!listToMove) {
      return res.status(404).json({ message: "List not found" });
    }

    const filtered = lists.filter((l) => l._id.toString() !== listId);

    filtered.splice(newPosition, 0, listToMove);

    await Promise.all(
      filtered.map((l, index) => {
        l.position = index;
        return l.save();
      })
    );

    return res.status(200).json({
      message: "Lists reordered successfully",
      lists: filtered,
    });
  } catch (error) {
    console.error("Error reordering lists:", error);
    return res.status(500).json({
      message: "Server error while reordering lists",
    });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    if (!listId) {
      return res.status(400).json({
        message: "No or invalid listId!!",
        error: err.message,
      });
    }

    const deletedList = await deleteListService(req.user, listId);

    if (!deletedList) {
      return res.status(400).json({
        message: "List could not be deleted!!",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error deleting list!!",
      error: err.message,
    });
  }
};
