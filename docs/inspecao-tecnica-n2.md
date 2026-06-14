# Documento de Inspeção Técnica: Avaliação N2
  
**Disciplina:** Projeto e Arquitetura de Software  
**Projeto inspecionado:** Gestão de Finanças Pessoais (Full-Stack TypeScript - React + Node.js/Express + Prisma)  
**Github do Projeto:**  https://github.com/VictorKunzz/GestaoFinancasPessoais  
**Data da inspeção:** 28/05/2026  
  

---

## 1. Metodologia de Inspeção

A inspeção foi conduzida por meio de leitura estática do código-fonte, percorrendo o projeto de forma top-down: iniciou-se pelo mapeamento da estrutura de diretórios e arquivos de configuração (`package.json`, `tsconfig.json`), seguida da leitura integral dos arquivos de infraestrutura compartilhada (`api.ts`, middlewares, contextos), dos módulos de serviço do backend (`auth.service.ts`, `analytics.service.ts`, `badge.service.ts`, `transaction.service.ts`, `goal.service.ts`) e, por fim, dos módulos de página do frontend (`TransactionsPage.tsx`, `GoalsPage.tsx`, `DashboardPage.tsx`) e dos layouts (`AppLayout.tsx`, `AuthContext.tsx`). Para cada arquivo, verificou-se sistematicamente: (a) se a unidade possui mais de uma razão para mudar (SRP); (b) se está fechada para modificação mas aberta para extensão (OCP); (c) se depende de abstrações ou de implementações concretas (DIP); e (d) se existem duplicações de lógica, nomes obscuros ou comentários redundantes. O projeto utiliza o paradigma funcional modular em TypeScript; sendo assim, cada arquivo de serviço ou componente foi equiparado a uma classe, cada função exportada a um método, e cada variável de módulo a um atributo.

---

## 2. Análise de Princípios SOLID

### Violação 1: Princípio da Responsabilidade Única (SRP)

**Arquivo:** `backend/src/services/analytics.service.ts`  
**Trecho:**

```typescript
// analytics.service.ts — linhas 3–96
async function getHealthScore(userId: string) {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes  = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // [1] Responsabilidade: busca e acumulação de transações
  const transacoesMes = await prisma.transaction.findMany({ where: { userId, date: { gte: inicioMes, lte: fimMes } } });
  let totalReceitas = 0;
  let totalDespesas = 0;
  transacoesMes.forEach((t) => {
    const valor = Number(t.amount);
    if (t.type === "INCOME") totalReceitas += valor;
    else totalDespesas += valor;
  });

  // [2] Responsabilidade: algoritmo de cálculo do score financeiro
  const saldo = totalReceitas - totalDespesas;
  const percentualGasto = totalReceitas > 0 ? (totalDespesas / totalReceitas) * 100 : 100;
  let score = 0;
  if (percentualGasto <= 50) score = 100;
  else if (percentualGasto <= 70) score = 80;
  else if (percentualGasto <= 85) score = 60;
  else if (percentualGasto <= 100) score = 40;
  else score = 20;

  // [3] Responsabilidade: consulta e aplicação de bônus de metas
  const metas = await prisma.goal.findMany({ where: { userId } });
  if (metas.length > 0) {
    const metasComProgresso = metas.filter((m) => Number(m.savedAmount) > 0);
    if (metasComProgresso.length > 0) score = Math.min(100, score + 5);
  }

  // [4] Responsabilidade: geração de rótulo de nível e mensagem textual
  let nivel = "";
  let mensagem = "";
  if (score >= 80) { nivel = "Excelente"; mensagem = "Parabéns! ..."; }
  else if (score >= 60) { nivel = "Bom"; mensagem = "Você está no caminho..."; }
  // ...
}
```

**Princípio violado:** Single Responsibility Principle (SRP). A função acumula quatro responsabilidades distintas: (1) consulta e sumarização de transações, (2) cálculo do score financeiro, (3) consulta de metas e aplicação de bônus, e (4) geração da mensagem textual classificatória. Qualquer alteração em uma dessas responsabilidades força a edição da mesma função.

**Sugestão de refatoração:** Extrair cada responsabilidade em uma função separada: `sumTransactions(transactions)` retorna `{ totalReceitas, totalDespesas }`; `calculateScore(percentualGasto)` retorna o valor numérico; `applyGoalBonus(score, metas)` retorna o score ajustado; `buildScoreMessage(score)` retorna `{ nivel, mensagem }`. A função `getHealthScore` passa a orquestrar as chamadas sem conter lógica própria.

---

### Violação 2: Princípio da Responsabilidade Única (SRP)

**Arquivo:** `frontend/src/pages/TransactionsPage.tsx`  
**Trecho:**

```typescript
// TransactionsPage.tsx — linhas 15–108
export default function TransactionsPage() {
  // [1] Responsabilidade: estado de dados e busca remota
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // [2] Responsabilidade: estado de filtros e filtragem local
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // [3] Responsabilidade: estado de modais de UI
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // [4] Responsabilidade: lógica de negócio — verificação de badges
  async function handleSubmit(data: CreateTransactionRequest) {
    if (editingTransaction) {
      // ...atualiza transação
    } else {
      const created = await transactionService.create(data);
      setTransactions((prev) => [created, ...prev]);
      try {
        const badgeResult = await badgeService.check('first_transaction');
        if (badgeResult.awarded) addToast('badge', badgeResult.message);
      } catch (err) { console.error('Erro ao checar badge', err); }
    }
  }
  // ...renderização do JSX
}
```

**Princípio violado:** Single Responsibility Principle (SRP). O módulo/componente acumula: (1) busca e gestão de dados remotos, (2) filtragem e ordenação local de transações, (3) controle de estado de todos os modais de UI, e (4) lógica de domínio (verificação e concessão de badges). Quatro razões independentes para mudar estão concentradas em um único arquivo.

**Sugestão de refatoração:** Criar um hook `useTransactions()` que encapsula a busca de dados e as operações CRUD; um hook `useTransactionFilters(transactions)` que encapsula os filtros; e mover a lógica de verificação de badges para um serviço dedicado `badgeEvents.service.ts`. O componente de página passa a compor esses hooks, ficando responsável apenas pela renderização.

---

### Violação 3: Princípio Aberto-Fechado (OCP)

**Arquivo:** `backend/src/services/badge.service.ts`  
**Trecho:**

```typescript
// badge.service.ts — linhas 63–87
if (condition === "first_transaction") {
  const transacoes = await prisma.transaction.count({ where: { userId } });
  if (transacoes >= 1) mereceMedalha = true;
}
else if (condition === "first_goal") {
  const metas = await prisma.goal.count({ where: { userId } });
  if (metas >= 1) mereceMedalha = true;
}
else if (condition === "goal_reached") {
  const todasMetas = await prisma.goal.findMany({ where: { userId } });
  const atingiuAlguma = todasMetas.some(
    m => Number(m.savedAmount) >= Number(m.targetAmount)
  );
  if (atingiuAlguma) mereceMedalha = true;
}
else if (condition === "positive_month" || condition === "spent_less") {
  mereceMedalha = true;
}
```

**Princípio violado:** Open-Closed Principle (OCP). A função `checkAndAwardBadge` precisa ser **modificada** cada vez que uma nova badge é adicionada ao sistema, um novo bloco `else if` deve ser inserido. O módulo não está fechado para modificação.

**Sugestão de refatoração:** Definir uma interface `BadgeEvaluator` com um método `evaluate(userId: string): Promise<boolean>` e criar uma implementação separada para cada condição (`FirstTransactionEvaluator`, `FirstGoalEvaluator`, `GoalReachedEvaluator`, etc.). Registrar as implementações em um `Map<string, BadgeEvaluator>`. A função `checkAndAwardBadge` passa a fazer `evaluators.get(condition)?.evaluate(userId)` sem nenhuma condicional, novas badges são adicionadas criando novas implementações, sem tocar no código existente.

---

### Violação 4: Princípio da Inversão de Dependência (DIP)

**Arquivo:** `backend/src/services/auth.service.ts`  
**Trecho:**

```typescript
// auth.service.ts — linhas 1–5 e 39–57
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta-padrao";

async function login(email: string, password: string) {
  const usuario = await prisma.user.findUnique({ where: { email } });
  // ...
  const senhaCorreta = await bcrypt.compare(password, usuario.passwordHash);
  // ...
  const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, { expiresIn: "7d" });
  // ...
}
```

**Princípio violado:** Dependency Inversion Principle (DIP). O módulo de alto nível (serviço de autenticação, que contém regras de negócio) depende diretamente de implementações concretas de infraestrutura: `bcrypt` (hashing de senhas), `jsonwebtoken` (geração de tokens) e `prisma` (persistência). Não existe nenhuma abstração entre a lógica de negócio e os detalhes técnicos. Trocar a biblioteca de hashing ou o ORM exigiria modificar o serviço de negócio.

**Sugestão de refatoração:** Definir interfaces `IHashService` (com métodos `hash` e `compare`), `ITokenService` (com `sign` e `verify`) e `IUserRepository` (com `findByEmail`, `create`, etc.). O `auth.service.ts` passaria a receber essas interfaces via injeção de dependência (parâmetros do construtor/módulo). As implementações concretas (`BcryptHashService`, `JwtTokenService`, `PrismaUserRepository`) ficam na camada de infraestrutura.

---

### Violação 5: Princípio da Inversão de Dependência (DIP)

**Arquivo:** `frontend/src/services/api.ts`  
**Trecho:**

```typescript
// api.ts — linhas 12–37
// Interceptor: adiciona token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');   // ← acesso direto a localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redireciona para login se token expirou (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');           // ← acesso direto a localStorage
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';           // ← acesso direto a window.location
      }
    }
    return Promise.reject(error);
  }
);
```

**Princípio violado:** Dependency Inversion Principle (DIP). A camada de transporte HTTP (módulo `api.ts`) depende diretamente de detalhes de implementação do browser: `localStorage` (gestão de sessão) e `window.location` (navegação). O módulo de nível mais baixo (HTTP) controla decisões que pertencem a camadas superiores (autenticação e roteamento), invertendo a hierarquia correta de dependências.

**Sugestão de refatoração:** Extrair a interação com `localStorage` para um `SessionStorage` service (ou usar o `AuthContext` existente como fonte de verdade). Passar para `api.ts` callbacks de configuração — `getToken: () => string | null` e `onUnauthorized: () => void` — como dependências injetadas na criação da instância. Assim a camada HTTP fica isolada das decisões de sessão e navegação.

---

### Violação 6: Princípio da Responsabilidade Única (SRP)

**Arquivo:** `backend/src/middlewares/auth.middleware.ts`  
**Trecho:**

```typescript
// auth.middleware.ts — linhas 6–33
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // [1] Responsabilidade: extração e parsing do header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Token nao fornecido" });
    return;
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    res.status(401).json({ error: "Formato de token invalido" });
    return;
  }
  const token = parts[1];

  try {
    // [2] Responsabilidade: validação criptográfica do token JWT
    const decoded = jwt.verify(token, JWT_SECRET as string)
      as unknown as { userId: string };

    // [3] Responsabilidade: mutação da requisição com dado derivado
    (req as any).userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token invalido ou expirado" });
    return;
  }
}
```

**Princípio violado:** Single Responsibility Principle (SRP). A função acumula três responsabilidades: (1) extração e validação do formato do cabeçalho `Authorization`, (2) verificação criptográfica do token JWT, e (3) enriquecimento da requisição com o `userId` extraído. Cada uma dessas operações tem razões independentes para mudar (ex: mudança no esquema do header, troca de biblioteca JWT, adição de campos ao payload).

**Sugestão de refatoração:** Extrair `extractBearerToken(header: string): string` para separar o parsing do cabeçalho; `verifyToken(token: string): { userId: string }` para isolar a validação JWT; e manter o middleware apenas como orquestrador que chama essas funções e injeta `req.userId`. Adicionalmente, declarar uma extensão de tipo (`interface AuthRequest extends Request { userId: string }`) para eliminar o `(req as any)`.

---

## 3. Análise de Práticas Clean Code

---

### 3.1 Más Práticas de Nomes

---

#### Nome 1: Variável de nome de letra única

**Arquivo:** `backend/src/services/analytics.service.ts`  
**Trecho:**

```typescript
// analytics.service.ts — linhas 21–28
transacoesMes.forEach((t) => {
  const valor = Number(t.amount);
  if (t.type === "INCOME") {
    totalReceitas += valor;
  } else {
    totalDespesas += valor;
  }
});
```

**Má prática:** O parâmetro `t` representa uma `Transaction`, mas o nome de única letra fornece zero informação semântica. Em um bloco com múltiplos acessos (`t.amount`, `t.type`), o leitor precisa inferir o tipo por contexto. O mesmo padrão se repete em `getBalanceForecast` (linha 194) e em callbacks de `filter`/`some` em outros arquivos (`m` para `Goal`, `c` para `Category`).

**Sugestão:** Renomear para `transaction` (ou `tx` como abreviação contextualmente aceita em finanças). `metas.filter((m) => ...)` deve ser `metas.filter((goal) => ...)`.

---

#### Nome 2: Nome abreviado e inconsistente

**Arquivo:** `backend/src/services/analytics.service.ts`  
**Trecho:**

```typescript
// analytics.service.ts — linhas 117–130
despesasMes.forEach((t) => {
  const catId = t.categoryId;   // ← abreviação "catId"
  const valor = Number(t.amount);

  if (!gastosPorCategoria[catId]) {
    gastosPorCategoria[catId] = {
      nome: t.category.name,
      total: 0,
      quantidade: 0,
    };
  }

  gastosPorCategoria[catId].total += valor;
  gastosPorCategoria[catId].quantidade += 1;
});
```

**Má prática:** `catId` é uma abreviação de `categoryId`, mas o projeto usa `categoryId` como nome canônico em tipos (`CreateTransactionRequest.categoryId`), parâmetros de filtros e nas entidades do Prisma. A inconsistência aumenta a carga cognitiva e pode causar confusão em buscas por referências no código.

**Sugestão:** Renomear para `categoryId` para manter consistência com o restante do sistema: `const categoryId = transaction.categoryId;`.

---

#### Nome 3: Nome genérico que esconde o propósito do dado

**Arquivo:** `backend/src/services/transaction.service.ts`  
**Trecho:**

```typescript
// transaction.service.ts — linhas 3–13
const palavrasChave: Record<string, string[]> = {
  Alimentacao: ["mercado", "supermercado", "restaurante", "lanche", ...],
  Transporte: ["gasolina", "combustivel", "uber", "onibus", ...],
  Moradia: ["aluguel", "condominio", "luz", "agua", "energia", ...],
  Saude: ["farmacia", "medico", "hospital", "remedio", ...],
  // ...
};
```

**Má prática:** `palavrasChave` ("palavras-chave") é um nome genérico que diz apenas que são palavras. Não comunica que é um **mapeamento de categorias financeiras para termos de auto-categorização de transações**. Um leitor novo no código precisará ler as linhas seguintes e a função `classificarCategoria` para entender o papel da variável.

**Sugestão:** Renomear para `categoryKeywords` (ou `termosDeAutoCategorizacao` se mantendo em português) para que o nome revele o propósito completo sem necessidade de leitura adicional.

---

#### Nome 4: Nome de função genérico sem contexto de entidade

**Arquivo:** `backend/src/services/transaction.service.ts`, `goal.service.ts`, `badge.service.ts`  
**Trecho:**

```typescript
// transaction.service.ts — linha 29
async function getAll(userId: string, filtros?: { ... }) { ... }

// goal.service.ts — linha 3
async function getAll(userId: string) { ... }

// badge.service.ts — linha 3 (única exceção com nome correto)
async function getAllBadges(userId: string) { ... }
```

**Má prática:** O nome `getAll` aparece em múltiplos módulos de serviço para buscar entidades completamente diferentes (transações, metas, categorias). Na leitura isolada do módulo ou ao refatorar, o nome `getAll` não carrega o tipo da entidade. Nota-se a inconsistência: `badge.service.ts` usou `getAllBadges` corretamente, enquanto os demais serviços não seguiram o mesmo padrão.

**Sugestão:** Padronizar para incluir o nome da entidade: `getAllTransactions`, `getAllGoals`, `getAllCategories`. Isso mantém consistência com `getAllBadges` já existente e torna cada função autoexplicativa em qualquer contexto de uso.

---

#### Nome 5: Nome excessivamente genérico para dado com forma específica

**Arquivo:** `backend/src/services/badge.service.ts`  
**Trecho:**

```typescript
// badge.service.ts — linhas 13–25
const resultado = todasMedalhas.map((m) => ({
  id: m.id,
  name: m.name,
  description: m.description,
  icon: m.icon,
  condition: m.condition,
  earned: idsConquistadas.has(m.id),
  earnedAt: idsConquistadas.has(m.id)
    ? usuarioMedalhas.find((um) => um.badgeId === m.id)?.earnedAt
    : null,
}));

return resultado;
```

**Má prática:** `resultado` é um nome completamente opaco. Não comunica que se trata de uma lista de badges enriquecidas com o status de conquista do usuário. O nome obriga o leitor a inspecionar a estrutura do objeto retornado para entender o que foi produzido.

**Sugestão:** Renomear para `badgesWithEarnedStatus` (ou `badgesComStatus`), que revela tanto o tipo dos elementos quanto a transformação aplicada.

---

### 3.2 Más Práticas de Comentários

---

#### Comentário 1: Comentário redundante/óbvio

**Arquivo:** `frontend/src/services/api.ts`  
**Trecho:**

```typescript
// api.ts — linhas 3–5
// Instância Axios configurada para a API
// Em desenvolvimento, o Vite proxy redireciona /api para localhost:3000
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});
```

**Má prática:** A primeira linha do comentário ("Instância Axios configurada para a API") é puramente redundante: o código já diz exatamente isso, `axios.create(...)` cria uma instância, e o arquivo se chama `api.ts`. O comentário não acrescenta nenhuma informação que o próprio código e o nome do arquivo não forneçam.

**Sugestão:** Remover a primeira linha. A segunda linha ("Em desenvolvimento, o Vite proxy redireciona...") tem valor, explica um comportamento não-óbvio de infraestrutura, e pode ser mantida sozinha.

---

#### Comentário 2: Comentário que parafraseia o código

**Arquivo:** `frontend/src/services/api.ts`  
**Trecho:**

```typescript
// api.ts — linhas 25–28
if (error.response?.status === 401) {
  // Limpa dados de autenticação
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // ...
}
```

**Má prática:** `// Limpa dados de autenticação` descreve exatamente o que as duas linhas seguintes fazem de forma explícita. Qualquer desenvolvedor que leia `localStorage.removeItem('token')` e `localStorage.removeItem('user')` entende imediatamente a intenção. O comentário não adiciona contexto sobre o *porquê*, apenas repete o *o quê*.

**Sugestão:** Remover o comentário. Se o objetivo for documentar a razão (ex: "necessário para forçar novo login após expiração do token"), substituir por um comentário que explique a motivação, não a implementação.

---

#### Comentário 3: Comentário que descreve o óbvio

**Arquivo:** `frontend/src/contexts/AuthContext.tsx`  
**Trecho:**

```typescript
// AuthContext.tsx — linhas 27–30
// Ao montar, verifica se já existe sessão no localStorage
useEffect(() => {
  const savedToken = localStorage.getItem('token');
  const savedUser  = localStorage.getItem('user');
  // ...
}, []);
```

**Má prática:** O comentário descreve o comportamento do código sem acrescentar nenhuma informação que o código já não expresse claramente: `useEffect` com array de dependências vazio sempre executa na montagem, e `localStorage.getItem('token')` evidentemente lê a sessão. O leitor que conhece React não precisa desta instrução.

**Sugestão:** Remover o comentário. Caso se deseje documentar algo relevante, documentar o motivo da escolha por `localStorage` em vez de `sessionStorage` ou cookies, isso seria um comentário com valor real.

---

#### Comentário 4: Comentários de seção mascarando ausência de abstração

**Arquivo:** `frontend/src/pages/TransactionsPage.tsx`  
**Trecho:**

```typescript
// TransactionsPage.tsx — linhas 22–33
// Filters
const [search, setSearch]         = useState('');
const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
const [categoryFilter, setCategoryFilter] = useState('');

// Modal state
const [modalOpen, setModalOpen]               = useState(false);
const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

// Delete confirmation
const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
const [deleting, setDeleting]         = useState(false);
```

**Má prática:** Os comentários `// Filters`, `// Modal state` e `// Delete confirmation` são usados para organizar grupos de variáveis dentro de uma função que cresceu além da sua responsabilidade. Comentários de seção em funções são um sinal clássico de que o código deve ser extraído, cada "seção comentada" deveria ser um hook ou módulo separado. São comentários que trabalham em vez da estrutura do código.

**Sugestão:** Extrair `useTransactionFilters()`, `useTransactionModal()` e `useDeleteConfirmation()` como hooks customizados. Com a extração, os comentários de seção se tornam desnecessários, os nomes dos hooks comunicam a organização.

---

#### Comentário 5: Comentário que descreve código autoexplicativo

**Arquivo:** `frontend/src/components/layout/AppLayout.tsx`  
**Trecho:**

```typescript
// AppLayout.tsx — linhas 6–12
// Mapeia rota → título da página
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transações',
  '/goals': 'Metas',
  '/badges': 'Conquistas',
};
```

**Má prática:** O comentário `// Mapeia rota → título da página` descreve o que `pageTitles: Record<string, string>` já comunica de forma inequívoca: é um registro que mapeia strings para strings, cujas chaves são rotas e cujos valores são títulos. O nome `pageTitles` e o tipo `Record<string, string>` tornam o comentário completamente supérfluo.

**Sugestão:** Remover o comentário. Opcionalmente, refinar o tipo para `Partial<Record<AppRoute, string>>` usando um tipo de união das rotas conhecidas, o que tornaria o contrato ainda mais explícito sem necessidade de documentação.

---

### 3.3 Violação de DRY (Don't Repeat Yourself)

#### DRY 1: Lógica de totalização de transações duplicada

**Arquivo:** `backend/src/services/analytics.service.ts`  
**Trecho:**

```typescript
// analytics.service.ts — OCORRÊNCIA 1: getHealthScore, linhas 18–28
let totalReceitas = 0;
let totalDespesas = 0;

transacoesMes.forEach((t) => {
  const valor = Number(t.amount);
  if (t.type === "INCOME") {
    totalReceitas += valor;
  } else {
    totalDespesas += valor;
  }
});

// ------------------------------------------------------------------

// analytics.service.ts — OCORRÊNCIA 2: getBalanceForecast, linhas 191–202
let totalReceitas = 0;
let totalDespesas = 0;

transacoes.forEach((t) => {
  const valor = Number(t.amount);
  if (t.type === "INCOME") {
    totalReceitas += valor;
  } else {
    totalDespesas += valor;
  }
});
```

**Má prática:** O bloco completo de 8 linhas (declaração das variáveis acumuladoras, iteração via `forEach`, conversão para `Number`, discriminação por `type` e acumulação em `totalReceitas`/`totalDespesas`) é **idêntico** nas funções `getHealthScore` e `getBalanceForecast`. Se a lógica de totalização precisar mudar (ex: excluir transações canceladas, tratar `Decimal` diferente de `Number`), a modificação precisará ser feita em dois lugares, com risco de inconsistência.

**Sugestão de refatoração:** Extrair uma função utilitária pura:

```typescript
function sumTransactionsByType(transactions: { type: string; amount: number | string }[]) {
  let totalReceitas = 0;
  let totalDespesas = 0;
  for (const transaction of transactions) {
    const valor = Number(transaction.amount);
    if (transaction.type === "INCOME") totalReceitas += valor;
    else totalDespesas += valor;
  }
  return { totalReceitas, totalDespesas };
}
```

Ambas as funções `getHealthScore` e `getBalanceForecast` passam a chamar `sumTransactionsByType(transacoes)`, eliminando a duplicação e centralizando a lógica em um único ponto de manutenção.


