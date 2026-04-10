import { Router } from "express";
import {
  checkMutualTrade,
  getReviews,
  submitReview,
  deleteReview,
  castVote,
  getVoteSummary,
} from "../controllers/reviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Public — anyone can read reviews and vote summaries
router.get("/:address", getReviews);
router.get("/:address/vote-summary", getVoteSummary);

// Auth required — mutual trade check happens inside the controller
router.get("/:address/check-trade", authMiddleware, checkMutualTrade);
router.post("/:address", authMiddleware, submitReview);
router.delete("/:address", authMiddleware, deleteReview);
router.post("/:address/vote", authMiddleware, castVote);

export default router;
