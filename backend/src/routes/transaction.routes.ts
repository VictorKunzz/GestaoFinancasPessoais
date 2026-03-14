import { Router } from "express";
import transactionController from "../controllers/transaction.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, transactionController.getAll);
router.get("/:id", authMiddleware, transactionController.getById);
router.post("/", authMiddleware, transactionController.create);
router.put("/:id", authMiddleware, transactionController.update);
router.delete("/:id", authMiddleware, transactionController.remove);

export default router;
