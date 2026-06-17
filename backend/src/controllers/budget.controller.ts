import { Request, Response } from "express";
import budgetService from "../services/budget.service";
import { createBudgetSchema, updateBudgetSchema } from "../validators/budget.validator";

async function list(req: Request, res: Response) {
  try {
    const orcamentos = await budgetService.list(req.userId);
    res.json(orcamentos);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req: Request, res: Response) {
  try {
    const dados = createBudgetSchema.parse(req.body);
    const orcamento = await budgetService.create(req.userId, dados.categoryId, dados.monthlyLimit);
    res.status(201).json(orcamento);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Categoria nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === "Ja existe um orcamento para esta categoria") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function update(req: Request, res: Response) {
  try {
    const dados = updateBudgetSchema.parse(req.body);
    const orcamento = await budgetService.update(req.userId, req.params.id as string, dados.monthlyLimit);
    res.json(orcamento);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Orcamento nao encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remove(req: Request, res: Response) {
  try {
    await budgetService.remove(req.userId, req.params.id as string);
    res.json({ message: "Orcamento removido com sucesso" });
  } catch (error: any) {
    if (error.message === "Orcamento nao encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { list, create, update, remove };
