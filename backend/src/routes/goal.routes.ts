import { Router } from "express";
import goalController from "../controllers/goal.controller";
import contributionController from "../controllers/contribution.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, goalController.getAll);
router.get("/:id", authMiddleware, goalController.getById);
router.post("/", authMiddleware, goalController.create);
router.put("/:id", authMiddleware, goalController.update);
router.delete("/:id", authMiddleware, goalController.remove);

// Aportes (vinculo de metas)
router.get("/:id/contributions", authMiddleware, contributionController.list);
router.post("/:id/contributions", authMiddleware, contributionController.create);
router.delete("/:id/contributions/:contributionId", authMiddleware, contributionController.remove);

export default router;
