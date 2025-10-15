import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
    googleId: String,
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
