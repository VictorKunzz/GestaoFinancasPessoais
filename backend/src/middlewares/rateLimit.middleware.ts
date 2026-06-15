import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

// Rate limiter em memoria (sem dependencias). Adequado para uma unica instancia.
// Protege endpoints sensiveis (login/registro) contra forca bruta.
export function createRateLimiter({ windowMs, max, message }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();

  // Limpeza periodica para evitar crescimento ilimitado do mapa.
  const interval = setInterval(() => {
    const agora = Date.now();
    for (const [chave, bucket] of buckets) {
      if (bucket.resetAt <= agora) buckets.delete(chave);
    }
  }, windowMs);
  // Nao impede o processo de encerrar.
  if (typeof interval.unref === "function") interval.unref();

  return function rateLimiter(req: Request, res: Response, next: NextFunction) {
    const chave = req.ip || req.socket.remoteAddress || "desconhecido";
    const agora = Date.now();
    const bucket = buckets.get(chave);

    if (!bucket || bucket.resetAt <= agora) {
      buckets.set(chave, { count: 1, resetAt: agora + windowMs });
      next();
      return;
    }

    bucket.count += 1;

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - agora) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        error: message || "Muitas requisicoes. Tente novamente mais tarde.",
      });
      return;
    }

    next();
  };
}
