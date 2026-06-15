import { Router } from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware";
import { createRateLimiter } from "../middlewares/rateLimit.middleware";

const router = Router();

// Limita tentativas em endpoints sensiveis para mitigar forca bruta.
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Muitas tentativas de autenticacao. Tente novamente em alguns minutos.",
});

router.post("/register", authLimiter, authController.register);

router.post("/login", authLimiter, authController.login);

router.get("/me", authMiddleware, authController.me);

export default router;
