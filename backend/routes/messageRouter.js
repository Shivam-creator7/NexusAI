import express from "express";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import {
  getMessage,
  sendMessage,
  askDoubt,
  getDoubts,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.use(authUserMiddleware);

// Core Lesson Messages
messageRouter.post("/", sendMessage);
messageRouter.get("/:chatId", getMessage);
messageRouter.post("/:chatId", sendMessage);

// Contextual Doubt Area Routes (Supports both REST conventions)
messageRouter.post("/doubt/:chatId", askDoubt);
messageRouter.get("/doubt/:chatId", getDoubts);
messageRouter.post("/:chatId/doubt", askDoubt);
messageRouter.get("/:chatId/doubts", getDoubts);
messageRouter.get("/:chatId/doubt", getDoubts);

export default messageRouter;