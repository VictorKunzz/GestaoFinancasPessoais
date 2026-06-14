// Augmenta o Request do Express com os dados injetados pelos middlewares de auth.
// userId e definido por authMiddleware; presente em todas as rotas protegidas.

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export {};
