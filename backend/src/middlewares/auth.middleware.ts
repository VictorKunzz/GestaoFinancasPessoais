import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Token nao fornecido" });
    return;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    res.status(401).json({ error: "Formato de token invalido" });
    return;
  }

  const token = parts[1] as string;

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as unknown as { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalido ou expirado" });
    return;
  }
}

export default authMiddleware;
