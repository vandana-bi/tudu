import {
  createCardService,
  assignMemberService,
  moveCardService,
  deleteCardService,
} from "../services/card.service.js";
import { canViewCard } from "../services/rbac.service.js";
import { calculateDueDate } from "../utils/card.helper.js";
import { uploadFileToCloudinary } from "../services/attachment.service.js";
import List from "../models/list.model.js";
import Board from "../models/board.model.js";
import Workspace from "../models/workspace.model.js";
import Card from "../models/card.model.js";

export const createCard = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, dueInDays } = req.body;

    if (!listId || !title || !dueInDays) {
      return res
        .status(400)
        .json({ message: "ListId, Title, DueInDays are required!!" });
    }

    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ message: "List not found!!" });

    const board = await Board.findById(list.boardId);
    if (!board) return res.status(404).json({ message: "Board not found!!" });

    const workspace = await Workspace.findById(board.workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found!!" });

    if (!canViewCard(req.user, null, list, board, workspace)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot create card!!" });
    }

    const dueDate = dueInDays
      ? calculateDueDate(new Date(), dueInDays).toISOString().split("T")[0]
      : null;

    const card = await createCardService(req.user, listId, {
      title,
      description,
      dueDate,
    });

    return res.status(201).json({
      message: "Card created successfully!!",
      card,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error creating card!!!",
      error: err.message,
    });
  }
};

export const uploadAttachment = async (req, res) => {
  try {
    const { cardId } = req.params; // card to attach file to
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: "Card not found!" });
    }

    const board = card.boardId;

    const workspace = board.workspaceId;

    if (!canAccessBoard(req.user, board, workspace)) {
      return res
        .status(403)
        .json({ message: "Not authorized to upload attachment to this card" });
    }

    const result = await uploadFileToCloudinary(req.file.buffer, "attachments");

    card.attachments.push({
      url: result.secure_url,
      public_id: result.public_id,
    });
    await card.save();

    return res.status(200).json({
      message: "File uploaded and attached successfully",
      attachment: { url: result.secure_url, public_id: result.public_id },
      card,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error uploading attachment",
      error: err.message,
    });
  }
};

export const getCardById = async (req, res) => {
  try {
    const { cardId } = req.params;
    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found!!" });

    const list = await List.findById(card.listId);
    const board = await Board.findById(list.boardId);
    const workspace = await Workspace.findById(board.workspaceId);

    if (!canViewCard(req.user, card, list, board, workspace)) {
      return res.status(403).json({ message: "Forbidden: cannot view card!!" });
    }

    return res.status(200).json({ card });
  } catch (err) {
    return res.status(500).json({
      message: "Error fetching card!!",
      error: err.message,
    });
  }
};

export const assignMember = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { memberId } = req.body;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found!!" });

    const list = await List.findById(card.listId);
    const board = await Board.findById(list.boardId);
    const workspace = await Workspace.findById(board.workspaceId);

    if (!canViewCard(req.user, card, list, board, workspace)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot assign members to card!!" });
    }

    const updatedCard = await assignMemberService(cardId, memberId);

    return res.status(200).json({
      message: "Member assigned successfully!!",
      card: updatedCard,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error assigning member!!",
      error: err.message,
    });
  }
};

export const moveCardAcrossLists = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { targetListId } = req.body;

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const sourceList = await List.findById(card.listId);
    const board = await Board.findById(sourceList.boardId);
    const workspace = await Workspace.findById(board.workspaceId);

    if (!canViewCard(req.user, card, sourceList, board, workspace)) {
      return res.status(403).json({ message: "Forbidden: cannot move card" });
    }

    const updatedCard = await moveCardService(cardId, targetListId);

    return res.status(200).json({
      message: "Card moved successfully!",
      card: updatedCard,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error moving card",
      error: err.message,
    });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!cardId) {
      return res.status(400).json({
        message: "CardId is required, please enter!!",
      });
    }

    await deleteCardService(cardId);
  } catch (err) {
    return res.status(400).json({
      message: "Error deleting card!!",
      error: err.message,
    });
  }
};
