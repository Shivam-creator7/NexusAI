import express from "express";
import multer from "multer";
import authUserMiddleware from "../middlewares/authUserMiddleware.js";
import {
  getRecentChat,
  createChat,
  createDocumentChat,
  getSingleChat,
  updateChatKnobs,
  deleteChat,
} from "../controllers/chatController.js";

const chatRouter = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});

chatRouter.use(authUserMiddleware);

// Routes for Learning Sessions and Knobs
chatRouter.post("/upload-document", upload.single("file"), createDocumentChat);
chatRouter.post("/createChat", createChat);
chatRouter.post("/", createChat);
chatRouter.get("/getRecentChat", getRecentChat);
chatRouter.get("/recent", getRecentChat);
chatRouter.get("/:chatId", getSingleChat);
chatRouter.patch("/:chatId/knobs", updateChatKnobs);
chatRouter.delete("/:chatId", deleteChat);

export default chatRouter;