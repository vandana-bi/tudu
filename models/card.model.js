import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    label: {
      type: String,
    },
    dueDate: {
      type: String,
    },
    listId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attachments: [
      {
        url: String,
        public_id: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);

export default Card;
