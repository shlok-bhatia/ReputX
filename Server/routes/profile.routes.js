import { Router } from "express";
import {
  getProfile,
  updateVisibility,
  getLeaderboard,
} from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.get("/leaderboard", getLeaderboard);
router.get("/:address", getProfile);
router.put("/visibility", authMiddleware, updateVisibility);

export default router;