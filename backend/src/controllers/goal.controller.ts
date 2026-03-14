import { Request, Response } from "express";
import goalService from "../services/goal.service";
import { createGoalSchema, updateGoalSchema } from "../validators/goal.validator";

async function getAll(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const metas = await goalService.getAll(userId);
    res.json(metas);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getById(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const meta = await goalService.getById(userId, req.params.id);
    res.json(meta);
  } catch (error: any) {
    if (error.message === "Meta nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dados = createGoalSchema.parse(req.body);
    const meta = await goalService.create(userId, dados);
    res.status(201).json(meta);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dados = updateGoalSchema.parse(req.body);
    const meta = await goalService.update(userId, req.params.id, dados);
    res.json(meta);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Meta nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await goalService.remove(userId, req.params.id);
    res.json({ message: "Meta removida com sucesso" });
  } catch (error: any) {
    if (error.message === "Meta nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { getAll, getById, create, update, remove };
