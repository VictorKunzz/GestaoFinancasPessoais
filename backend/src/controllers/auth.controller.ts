import { Request, Response } from "express";
import authService from "../services/auth.service";
import { registerSchema, loginSchema } from "../validators/auth.validator";

async function register(req: Request, res: Response) {
  try {

    const dados = registerSchema.parse(req.body);

    const usuario = await authService.register(dados.name, dados.email, dados.password);

    res.status(201).json(usuario);
  } catch (error: any) {

    if (error.name === "ZodError") {

      res.status(400).json({ error: error.errors });
      return;
    }

    if (error.message === "Email ja esta em uso") {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}


async function login(req: Request, res: Response) {
  try {

    const dados = loginSchema.parse(req.body);

    const resultado = await authService.login(dados.email, dados.password);

    res.json(resultado);
  } catch (error: any) {
    if (error.name === "ZodError") {
      res.status(400).json({ error: error.errors });
      return;
    }

    if (error.message === "Email ou senha incorretos") {
      res.status(401).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;

    const usuario = await authService.getProfile(userId);

    res.json(usuario);
  } catch (error: any) {
    if (error.message === "Usuario nao encontrado") {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export default { register, login, me };
