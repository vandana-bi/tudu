import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    visibility: {
      type: String,
      enum: ["Private", "Public", "Global"],
      default: "Private",
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Board = mongoose.model("Board", boardSchema);

export default Board;
