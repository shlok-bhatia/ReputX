import express from "express";
import { getMilestones, createMilestone } from "../controllers/milestoneController.js";

const router = express.Router();

// GET /api/milestones/:address
router.get("/:address", getMilestones);

// POST /api/milestones
router.post("/", createMilestone);

export default router;
