import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { Role } from "../generated/prisma/enums";

// Deve rodar depois do authMiddleware (que popula req.userId).
async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const usuario = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true },
    });

    if (!usuario || usuario.role !== Role.ADMIN) {
      res.status(403).json({ error: "Acesso restrito a administradores" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default adminMiddleware;
