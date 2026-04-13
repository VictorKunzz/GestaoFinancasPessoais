import { Request, Response } from "express";
import badgeService from "../services/badge.service";
import { checkBadgeSchema } from "../validators/badge.validator";

async function getAllBadges(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const medalhas = await badgeService.getAllBadges(userId);
    res.json(medalhas);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getUserBadges(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const conquistas = await badgeService.getUserBadges(userId);
    res.json(conquistas);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function checkAndAwardBadge(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dados = checkBadgeSchema.parse(req.body);
    
    const result = await badgeService.checkAndAwardBadge(userId, dados.condition);
    
    if (!result) {
      res.json({ awarded: false, message: "Medalha não existe ou já foi conquistada" });
      return;
    }

    if (result.awarded) {
      res.status(201).json({ 
        awarded: true, 
        message: `Parabéns! Você conquistou a medalha: ${result.badge?.name}`,
        badge: result.badge
      });
      return;
    }

    res.json({ awarded: false, message: "Você ainda não atingiu os requisitos para esta medalha" });

  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { getAllBadges, getUserBadges, checkAndAwardBadge };
