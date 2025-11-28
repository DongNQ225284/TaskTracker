import express from "express";
import {
  sendInvitation,
  acceptInvitation,
} from "../controllers/invitationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, sendInvitation);
router.post("/accept", protect, acceptInvitation);

export default router;
