import { Router } from "express";
import budgetController from "../controllers/budget.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, budgetController.list);
router.post("/", authMiddleware, budgetController.create);
router.put("/:id", authMiddleware, budgetController.update);
router.delete("/:id", authMiddleware, budgetController.remove);

export default router;
