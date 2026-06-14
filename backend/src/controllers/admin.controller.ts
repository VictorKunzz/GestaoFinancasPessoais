import { Request, Response } from "express";
import adminService from "../services/admin.service";
import {
  updateUserRoleSchema,
  createBadgeSchema,
  updateBadgeSchema,
} from "../validators/admin.validator";

// ===== Usuários =====
async function listUsers(_req: Request, res: Response) {
  try {
    const usuarios = await adminService.listUsers();
    res.json(usuarios);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function updateUserRole(req: Request, res: Response) {
  try {
    const dados = updateUserRoleSchema.parse(req.body);
    const usuario = await adminService.updateUserRole(
      req.userId,
      req.params.id as string,
      dados.role
    );
    res.json(usuario);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Usuario nao encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === "Voce nao pode alterar o seu proprio papel") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function removeUser(req: Request, res: Response) {
  try {
    await adminService.removeUser(req.userId, req.params.id as string);
    res.json({ message: "Usuario removido com sucesso" });
  } catch (error: any) {
    if (error.message === "Usuario nao encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === "Voce nao pode remover a sua propria conta") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// ===== Badges =====
async function listBadges(_req: Request, res: Response) {
  try {
    const badges = await adminService.listBadges();
    res.json(badges);
  } catch (error: any) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function createBadge(req: Request, res: Response) {
  try {
    const dados = createBadgeSchema.parse(req.body);
    const badge = await adminService.createBadge(dados);
    res.status(201).json(badge);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function updateBadge(req: Request, res: Response) {
  try {
    const dados = updateBadgeSchema.parse(req.body);
    const badge = await adminService.updateBadge(req.params.id as string, dados);
    res.json(badge);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }
    if (error.message === "Badge nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function removeBadge(req: Request, res: Response) {
  try {
    await adminService.removeBadge(req.params.id as string);
    res.json({ message: "Badge removida com sucesso" });
  } catch (error: any) {
    if (error.message === "Badge nao encontrada") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default {
  listUsers,
  updateUserRole,
  removeUser,
  listBadges,
  createBadge,
  updateBadge,
  removeBadge,
};
