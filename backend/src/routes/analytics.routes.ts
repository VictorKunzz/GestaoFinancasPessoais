import { Router } from "express";
import analyticsController from "../controllers/analytics.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/health-score", authMiddleware, analyticsController.getHealthScore);
router.get("/insights", authMiddleware, analyticsController.getInsights);
router.get("/forecast", authMiddleware, analyticsController.getBalanceForecast);

export default router;
