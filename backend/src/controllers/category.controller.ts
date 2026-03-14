import { Request, Response } from "express";
import categoryService from "../services/category.service";
import { createCategorySchema, updateCategorySchema } from "../validators/category.validator";

async function getAll(_req: Request, res: Response) {
  try {
    const categorias = await categoryService.getAll();
    res.json(categorias);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function getById(req: Request, res: Response) {
  try {
    const categoria = await categoryService.getById(req.params.id);
    res.json(categoria);
  } catch (error: any) {
    if (error.message === "Categoria nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req: Request, res: Response) {
  try {
    const dados = createCategorySchema.parse(req.body);
    const categoria = await categoryService.create(dados.name, dados.icon);
    res.status(201).json(categoria);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Ja existe uma categoria com esse nome") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function update(req: Request, res: Response) {
  try {
    const dados = updateCategorySchema.parse(req.body);
    const categoria = await categoryService.update(req.params.id, dados);
    res.json(categoria);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Categoria nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === "Categorias padrao nao podem ser editadas" ||
        error.message === "Ja existe uma categoria com esse nome") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function remove(req: Request, res: Response) {
  try {
    await categoryService.remove(req.params.id);
    res.json({ message: "Categoria removida com sucesso" });
  } catch (error: any) {
    if (error.message === "Categoria nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === "Categorias padrao nao podem ser removidas") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { getAll, getById, create, update, remove };
