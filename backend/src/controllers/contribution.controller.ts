import { Request, Response } from "express";
import contributionService from "../services/contribution.service";
import { createContributionSchema } from "../validators/contribution.validator";

async function list(req: Request, res: Response) {
  try {
    const aportes = await contributionService.list(req.userId, req.params.id as string);
    res.json(aportes);
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
    const dados = createContributionSchema.parse(req.body);
    const resultado = await contributionService.create(req.userId, req.params.id as string, dados);
    res.status(201).json(resultado);
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
    const resultado = await contributionService.remove(
      req.userId,
      req.params.id as string,
      req.params.contributionId as string
    );
    res.json(resultado);
  } catch (error: any) {
    if (error.message === "Meta nao encontrada" || error.message === "Aporte nao encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { list, create, remove };
