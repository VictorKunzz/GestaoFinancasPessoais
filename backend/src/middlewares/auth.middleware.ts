import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta-padrao";

// Esse middleware verifica se o usuario esta autenticado
// Ele pega o token do header "Authorization", valida e coloca o userId no request
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Pega o header Authorization (ex: "Bearer eyJhbGciOi...")
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Token nao fornecido" });
    return;
  }

  // Separa "Bearer" do token
  const parts = authHeader.split(" ");

  if (parts.length !== 2) {
    res.status(401).json({ error: "Formato de token invalido" });
    return;
  }

  const token = parts[1];

  try {
    // Verifica se o token e valido
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };

    // Coloca o userId no request para usar nos controllers
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalido ou expirado" });
    return;
  }
}

export default authMiddleware;
