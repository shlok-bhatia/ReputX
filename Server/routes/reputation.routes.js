import { Router } from "express";
import {
  getReputation,
  recalculateReputation,
  publicScoreAPI,
} from "../controllers/reputationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import { recalculateLimiter, publicApiLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.get("/:address", getReputation);
router.post("/recalculate", authMiddleware, recalculateReputation);

// Public API for third-party dApps
router.get("/api/score/:address", publicScoreAPI);

export default router;