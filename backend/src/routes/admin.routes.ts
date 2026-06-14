import { Router } from "express";
import adminController from "../controllers/admin.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminMiddleware from "../middlewares/admin.middleware";

const router = Router();

// Todas as rotas exigem autenticacao + papel ADMIN
router.use(authMiddleware, adminMiddleware);

// Usuários
router.get("/users", adminController.listUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.removeUser);

// Badges
router.get("/badges", adminController.listBadges);
router.post("/badges", adminController.createBadge);
router.put("/badges/:id", adminController.updateBadge);
router.delete("/badges/:id", adminController.removeBadge);

export default router;
