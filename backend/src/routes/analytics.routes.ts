import { Router } from "express";
import analyticsController from "../controllers/analytics.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/health-score", authMiddleware, analyticsController.getHealthScore);
router.get("/insights", authMiddleware, analyticsController.getInsights);
router.get("/forecast", authMiddleware, analyticsController.getBalanceForecast);
router.get("/cashflow", authMiddleware, analyticsController.getCashflow);
router.get("/comparison", authMiddleware, analyticsController.getMonthlyComparison);

export default router;
