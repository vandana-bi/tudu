import mongoose from "mongoose";

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    position: {
      type: Number,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const List = mongoose.model("List", listSchema);

export default List;
