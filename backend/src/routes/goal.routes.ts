import { Router } from "express";
import goalController from "../controllers/goal.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, goalController.getAll);
router.get("/:id", authMiddleware, goalController.getById);
router.post("/", authMiddleware, goalController.create);
router.put("/:id", authMiddleware, goalController.update);
router.delete("/:id", authMiddleware, goalController.remove);

export default router;
