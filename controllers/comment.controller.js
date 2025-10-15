import Board from "../models/board.model.js";
import Card from "../models/card.model.js";
import Comment from "../models/comment.model.js";
import Workspace from "../models/workspace.model.js";
import {
  canEditComment,
  canManageComment,
  canCommentOnCard,
} from "../services/rbac.service.js";

export const addComment = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        message:
          "Comment required, write something before submitting request!!",
      });
    }

    const card = await Card.findById(cardId);
    if (!card) return res.status(404).json({ message: "Card not found!!" });

    const board = await Board.findById(card.boardId);
    if (!board) return res.status(404).json({ message: "Board not found!!" });

    const workspace = await Workspace.findById(board.workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found!!" });

    if (!canCommentOnCard(req.user, card, board, workspace)) {
      return res
        .status(403)
        .json({ message: "Forbidden: you cannot comment on this card!!" });
    }

    const comment = await Comment.create({
      comment: text,
      author: req.user.id,
      cardId,
    });

    return res
      .status(201)
      .json({ message: "Comment added to the card successfully!!", comment });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error adding comment!!", error: err.message });
  }
};

export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Updated comment text required!!" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found!!" });

    const card = await Card.findById(comment.cardId);
    if (!card) return res.status(404).json({ message: "Card not found!!" });

    const board = await Board.findById(card.boardId);
    if (!board) return res.status(404).json({ message: "Board not found!!" });

    const workspace = await Workspace.findById(board.workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found!!" });

    if (!canEditComment(req.user, comment, board, workspace)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot edit this comment!!" });
    }

    comment.comment = text;
    await comment.save();

    return res.status(200).json({
      message: "Comment updated successfully!!",
      comment,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error editing comment!!", error: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found!!" });

    const card = await Card.findById(comment.cardId);
    if (!card) return res.status(404).json({ message: "Card not found!!" });

    const board = await Board.findById(card.boardId);
    if (!board) return res.status(404).json({ message: "Board not found!!" });

    const workspace = await Workspace.findById(board.workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found!!" });

    if (!canManageComment(req.user, comment, board, workspace)) {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot delete this comment!!" });
    }

    await comment.deleteOne();

    return res.status(200).json({
      message: "Comment deleted successfully!!",
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting comment!!", error: err.message });
  }
};
