import express from "express";
import { loginWithGoogle, getMe } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/google", loginWithGoogle);
router.get("/me", protect, getMe);

export default router;
