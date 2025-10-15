import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const githubAuthCallback = (req, res) => {
  if (req.user) {
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EXPIRES_IN }
    );
    res.status(200).json({
      message: "GitHub authentication successful",
      user: req.user,
      token,
    });
  } else {
    res.status(401).json({ message: "GitHub authentication failed" });
  }
};
