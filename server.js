import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import workspaceRoutes from "./routes/workspace.route.js";
import boardRoutes from "./routes/board.route.js";
import listRoutes from "./routes/list.route.js";
import cardRoutes from "./routes/card.route.js";
import "./config/passport.config.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-session",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", workspaceRoutes);
app.use("/api", boardRoutes);
app.use("/api", listRoutes);
app.use("/api", cardRoutes);

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log(`DB Connection Successful! 🎉`);
  })
  .catch((err) => {
    console.log(`DB Connection Failed! ☠️`);
  });

app.listen(process.env.PORT, "127.0.0.1", () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
