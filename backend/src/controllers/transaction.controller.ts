import { Request, Response } from "express";
import transactionService from "../services/transaction.service";
import { createTransactionSchema, updateTransactionSchema } from "../validators/transaction.validator";

async function getAll(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const filtros = {
      type: req.query.type as string | undefined,
      categoryId: req.query.categoryId as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const transacoes = await transactionService.getAll(userId, filtros);
    res.json(transacoes);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getById(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const transacao = await transactionService.getById(userId, req.params.id);
    res.json(transacao);
  } catch (error: any) {
    if (error.message === "Transacao nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dados = createTransactionSchema.parse(req.body);
    const transacao = await transactionService.create(userId, dados);
    res.status(201).json(transacao);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Categoria nao encontrada") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function update(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const dados = updateTransactionSchema.parse(req.body);
    const transacao = await transactionService.update(userId, req.params.id, dados);
    res.json(transacao);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Transacao nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    await transactionService.remove(userId, req.params.id);
    res.json({ message: "Transacao removida com sucesso" });
  } catch (error: any) {
    if (error.message === "Transacao nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { getAll, getById, create, update, remove };
