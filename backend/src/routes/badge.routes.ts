import { Router } from "express";
import badgeController from "../controllers/badge.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, badgeController.getAllBadges);

router.get("/my-badges", authMiddleware, badgeController.getUserBadges);

router.post("/check", authMiddleware, badgeController.checkAndAwardBadge);

export default router;
