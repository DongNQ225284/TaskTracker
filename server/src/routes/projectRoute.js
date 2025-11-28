import express from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  removeMember,
  updateMemberRole,
  leaveProject,
} from "../controllers/projectController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createProject).get(protect, getMyProjects);

// Routes for operations on a specific Project
router
  .route("/:id")
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

// Routes for Member management
router
  .route("/:projectId/members/:userId")
  .delete(protect, removeMember)
  .patch(protect, updateMemberRole);

// Route for leaving a project
router.post("/:id/leave", protect, leaveProject);

export default router;
