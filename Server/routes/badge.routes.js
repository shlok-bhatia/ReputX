import { Router } from "express";
import { getBadges } from "../controllers/badgeController.js";

const router = Router();

router.get("/:address", getBadges);

export default router;