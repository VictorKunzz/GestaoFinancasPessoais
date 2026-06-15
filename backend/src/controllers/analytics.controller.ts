import { Request, Response } from "express";
import analyticsService from "../services/analytics.service";

async function getHealthScore(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const resultado = await analyticsService.getHealthScore(userId);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getInsights(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const resultado = await analyticsService.getInsights(userId);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getBalanceForecast(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const resultado = await analyticsService.getBalanceForecast(userId);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getCashflow(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const mesesParam = Number(req.query.months);
    const meses = Number.isFinite(mesesParam) && mesesParam >= 1 && mesesParam <= 12 ? mesesParam : 6;
    const resultado = await analyticsService.getCashflow(userId, meses);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getMonthlyComparison(req: Request, res: Response) {
  try {
    const userId = req.userId;
    const resultado = await analyticsService.getMonthlyComparison(userId);
    res.json(resultado);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { getHealthScore, getInsights, getBalanceForecast, getCashflow, getMonthlyComparison };
