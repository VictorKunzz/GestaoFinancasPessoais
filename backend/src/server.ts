import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { securityHeaders, notFoundHandler, errorHandler } from './middlewares/security.middleware';
import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/category.routes';
import transactionRoutes from './routes/transaction.routes';
import goalRoutes from './routes/goal.routes';
import analyticsRoutes from './routes/analytics.routes';
import badgeRoutes from './routes/badge.routes';
import adminRoutes from './routes/admin.routes';
import budgetRoutes from './routes/budget.routes';

const app = express();
const PORT = env.PORT;

// CORS: restringe as origens quando CORS_ORIGIN esta definido; libera tudo em dev.
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);

app.use(securityHeaders);
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/budgets', budgetRoutes);

// 404 para rotas nao mapeadas e handler de erro global (deve vir por ultimo).
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
