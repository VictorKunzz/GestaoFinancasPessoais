// ===== Tipos do Sistema de Gestão de Finanças Pessoais =====

// --- Auth ---
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// --- Categorias ---
export interface Category {
  id: string;
  name: string;
  icon: string | null;
  isDefault: boolean;
}

// --- Transações ---
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  type: TransactionType;
  description: string;
  amount: number | string; // Decimal vem como string do Prisma
  date: string;
  createdAt: string;
  category?: Category;
}

export interface CreateTransactionRequest {
  categoryId?: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
}

export interface UpdateTransactionRequest {
  categoryId?: string;
  type?: TransactionType;
  description?: string;
  amount?: number;
  date?: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

// --- Metas ---
export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number | string;
  savedAmount: number | string;
  deadline: string | null;
  createdAt: string;
}

export interface CreateGoalRequest {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  deadline?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  savedAmount?: number;
  deadline?: string;
}

// --- Analytics ---
export interface HealthScore {
  score: number;
  nivel: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  percentualGasto: number;
  mensagem: string;
}

export interface InsightCategory {
  nome: string;
  total: number;
  quantidade: number;
  percentual: number;
}

export interface Insights {
  mes: string;
  totalGasto: number;
  categorias: InsightCategory[];
  dicas: string[];
}

export interface BalanceForecast {
  previsaoReceita: number;
  previsaoDespesa: number;
  previsaoSaldo: number;
  mensagem: string;
}

// --- Badges ---
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  condition: string;
  earned: boolean;
  earnedAt: string | null;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  earnedAt: string;
}

export interface BadgeCheckResponse {
  awarded: boolean;
  message: string;
  badge?: Badge;
}
