import express from "express";
import {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  deleteTask,
  updateTask,
  getTaskById,
  getMyAssignedTasks,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../config/upload.js";

const router = express.Router();

router.get("/assigned/me", protect, getMyAssignedTasks);
router.post("/", protect, createTask);

router.get("/:projectId", protect, getTasksByProject);

router
  .route("/detail/:id")
  .get(protect, getTaskById)
  .put(protect, updateTask)
  .delete(protect, deleteTask);

router.patch("/:id/status", protect, updateTaskStatus);

router.post(
  "/:id/attachments",
  protect,
  upload.array("files", 5),
  uploadTaskAttachment
);

router.delete(
  "/:taskId/attachments/:attachmentId",
  protect,
  deleteTaskAttachment
);
export default router;
