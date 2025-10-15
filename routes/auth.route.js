import express from "express";
import passport from "passport";

import {
  forgotPassword,
  login,
  resetPassword,
  signup,
  getMe,
} from "../controllers/auth.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
import { googleAuthCallback } from "../controllers/google.auth.controller.js";
import { facebookAuthCallback } from "../controllers/fb.auth.controller.js";
import { githubAuthCallback } from "../controllers/github.auth.controller.js";

const router = express.Router();

router.post("/signup", signup); //w
router.post("/login", login); //w
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", authenticateJWT, getMe);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleAuthCallback
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  facebookAuthCallback
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  githubAuthCallback
);

export default router;
