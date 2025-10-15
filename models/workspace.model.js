import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    workspaceType: {
      type: String,
      enum: [
        "Small Business",
        "Human Resource",
        "Marketing",
        "Operations",
        "Education",
        "Engineering",
        "Sales",
        "Other",
      ],
      default: "Other",
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    label: [
      {
        type: String,
      },
    ],
    visibility: {
      type: String,
      enum: ["Private", "Public"],
      default: "Private",
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace;
