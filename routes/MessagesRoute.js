import { Router } from "express";
import { getMessages, uploadFile } from "../controllers/MessagesController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const messagesRoutes = Router();

// Configure multer with file size limit
const upload = multer({
  dest: "uploads/files/", // Destination folder for uploaded files
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post(
  "/upload-file",
  verifyToken,
  upload.single("file"),
  uploadFile
);

export default messagesRoutes;
 
