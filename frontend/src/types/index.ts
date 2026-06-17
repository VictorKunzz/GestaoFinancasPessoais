// ===== Tipos do Sistema de Gestão de Finanças Pessoais =====

// --- Auth ---
export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: Role;
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
  userId?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  icon?: string;
}

// --- Transações ---
export type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT';

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  goalId?: string | null;
  type: TransactionType;
  description: string;
  amount: number | string; // Decimal vem como string do Prisma
  date: string;
  createdAt: string;
  category?: Category;
  goal?: { id: string; name: string } | null;
}

export interface CreateTransactionRequest {
  categoryId?: string;
  goalId?: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
}

export interface UpdateTransactionRequest {
  categoryId?: string;
  goalId?: string | null;
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
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  totalInvestimentos: number;
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
  previsaoInvestimento: number;
  previsaoSaldo: number;
  mensagem: string;
}

export interface CashflowPoint {
  mes: string;
  label: string;
  receitas: number;
  despesas: number;
  investimentos: number;
  saldo: number;
}

export interface Cashflow {
  meses: CashflowPoint[];
}

export interface MonthlyComparison {
  gastoMesAtual: number;
  mediaAnterior: number;
  variacaoPercentual: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
  mensagem: string;
}

// --- Orçamentos ---
export interface Budget {
  id: string;
  categoryId: string;
  category: { id: string; name: string; icon: string | null };
  monthlyLimit: number;
  spent: number;
  percentage: number;
  exceeded: boolean;
}

export interface CreateBudgetRequest {
  categoryId: string;
  monthlyLimit: number;
}

export interface UpdateBudgetRequest {
  monthlyLimit: number;
}

// --- Badges ---
export type BadgeCondition =
  | 'FIRST_TRANSACTION'
  | 'FIRST_GOAL'
  | 'GOAL_REACHED'
  | 'POSITIVE_MONTH'
  | 'SPENT_LESS';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  condition: BadgeCondition;
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

// --- Admin ---
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  transactionsCount: number;
  goalsCount: number;
}

export interface AdminBadge {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  condition: BadgeCondition;
  _count?: { userBadges: number };
}

export interface CreateBadgeRequest {
  name: string;
  description: string;
  icon?: string;
  condition: BadgeCondition;
}

export interface UpdateBadgeRequest {
  name?: string;
  description?: string;
  icon?: string;
  condition?: BadgeCondition;
}
