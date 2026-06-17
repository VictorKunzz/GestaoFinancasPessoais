import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

// Cabecalhos de seguranca basicos (substitui o helmet sem adicionar dependencia).
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.removeHeader("X-Powered-By");
  next();
}

// 404 padronizado para rotas inexistentes.
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Recurso nao encontrado" });
}

// Handler de erro global: registra o detalhe no servidor e nunca vaza stack trace ao cliente.
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err?.name === "ZodError") {
    res.status(400).json({ error: err.errors });
    return;
  }

  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "Corpo da requisicao excede o limite permitido" });
    return;
  }

  console.error("Erro nao tratado:", err);

  const body: { error: string; detail?: string } = { error: "Erro interno do servidor" };
  if (env.NODE_ENV !== "production") {
    body.detail = err?.message;
  }
  res.status(500).json(body);
}
