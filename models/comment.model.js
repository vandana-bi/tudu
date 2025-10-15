import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
