import { Router } from "express";
import categoryController from "../controllers/category.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, categoryController.getAll);
router.get("/:id", authMiddleware, categoryController.getById);
router.post("/", authMiddleware, categoryController.create);
router.put("/:id", authMiddleware, categoryController.update);
router.delete("/:id", authMiddleware, categoryController.remove);

export default router;
