import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getLeaderboard,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/leaderboard", getLeaderboard);
router.get("/:address", getProfile);
router.put("/update", authMiddleware, updateProfile);

export default router;