# Gestão de Finanças Pessoais

Projeto desenvolvido para a disciplina de Programação Web no curso de Engenharia de Software.

Sistema de controle financeiro pessoal com dashboard visual, insights automáticos, score de saúde financeira, previsão de saldo e gamificação.

---

##  Objetivo

Ajudar o usuário a controlar sua vida financeira de forma visual, simples e inteligente, mostrando não só os gastos, mas também **insights e previsões** sobre seus hábitos financeiros.

---

## Requisitos Funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Cadastro de usuário com nome, e-mail e senha | Alta |
| RF02 | Login com e-mail e senha, retornando token JWT | Alta |
| RF03 | Criação de transações (receita/despesa) com valor, descrição, data e categoria | Alta |
| RF04 | Listagem de transações com filtros por período, categoria e tipo | Alta |
| RF05 | Dashboard com saldo total atual | Alta |
| RF06 | Gráficos de gastos por categoria e por período | Alta |
| RF07 | Score de saúde financeira (0–100) | Média |
| RF08 | Insights automáticos comparando mês atual vs. média dos últimos 3 meses | Média |
| RF09 | Projeção de saldo futuro para 30, 60 e 90 dias | Média |
| RF10 | Criação de metas financeiras com valor alvo e prazo | Média |
| RF11 | Previsão de conclusão de cada meta financeira | Média |
| RF12 | Classificação automática de transações por palavras-chave | Média |
| RF13 | Gamificação com medalhas por conquistas | Baixa |
| RF14 | Criação de categorias personalizadas | Baixa |

## Requisitos Não-Funcionais

| ID | Requisito | Tipo |
|---|---|---|
| RNF01 | Senhas armazenadas com bcrypt (hash + salt) | Segurança |
| RNF02 | Rotas protegidas exigem JWT válido | Segurança |
| RNF03 | API responde em < 500ms para operações comuns | Performance |
| RNF04 | Frontend responsivo (mobile-first) | Usabilidade |
| RNF05 | Backend com TypeScript e tipagem estrita | Manutenibilidade |
| RNF06 | Validação de dados com Zod no back e front | Confiabilidade |
| RNF07 | PostgreSQL com Prisma ORM | Portabilidade |

---

## Funcionalidades Principais

- Cadastro e login de usuário
- Registro de receitas e despesas
- Dashboard com saldo total
- Gráficos de gastos por categoria
- Filtro por período

---

## Funcionalidades Diferenciadas

### Score de saúde financeira
Um número de 0 a 100 que mostra o quão saudável estão suas finanças, calculado com base em: relação receita/despesa, regularidade de depósitos em metas e ausência de meses no vermelho.

### Insights automáticos
O sistema analisa seus dados e mostra coisas como:
- "Você gastou mais do que o normal esse mês"
- "Seu maior gasto foi com alimentação"
- "Se continuar assim, seu saldo acaba em X dias"

### Previsão de saldo
Projeção do saldo futuro para 30, 60 e 90 dias, baseado na média de receitas e despesas dos últimos 3 meses.

### Metas com previsão de conclusão
O sistema calcula em quanto tempo você consegue atingir uma meta financeira, baseado no seu ritmo atual de economia.

### Classificação automática de gastos
Se o usuário digitar algo tipo "Uber" ou "McDonalds", o sistema classifica automaticamente na categoria correta (Transporte, Alimentação, etc).

### Gamificação
Pequenos incentivos como medalhas, metas atingidas e evolução mês a mês.

---

## Arquitetura (Modelo C4)

### Nível 1 — Contexto

O **Usuário** interage com o **Sistema de Gestão de Finanças Pessoais** via navegador web. O sistema é autossuficiente — não depende de sistemas externos (bancos, APIs de terceiros).

```
┌──────────┐        HTTPS        ┌─────────────────────────────────┐
│  Usuário │ ──────────────────> │ Sistema de Gestão de Finanças   │
│          │                     │ Pessoais                        │
└──────────┘                     └─────────────────────────────────┘
```

### Nível 2 — Container

O sistema é dividido em 3 containers:

```
┌─────────────────────────────────────────────────────────────────┐
│               Sistema de Gestão de Finanças Pessoais            │
│                                                                 │
│  ┌──────────────────┐   HTTP/JSON   ┌────────────────────────┐  │
│  │ Frontend SPA     │ ────────────> │ API REST               │  │
│  │ React + Vite     │               │ Node.js + Express + TS │  │
│  │ TailwindCSS      │               │ Porta 3000             │  │
│  │ Porta 5173       │               └──────────┬─────────────┘  │
│  └──────────────────┘                          │ Prisma ORM     │
│                                       ┌────────▼──────────┐     │
│                                       │ PostgreSQL        │     │
│                                       │ Banco de Dados    │     │
│                                       └───────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

| Container | Tecnologia | Responsabilidade |
|---|---|---|
| **Frontend SPA** | React 18 + Vite + TailwindCSS v3 | Interface visual, gráficos, formulários |
| **API REST** | Node.js + Express + TypeScript | Regras de negócio, autenticação, analytics |
| **Banco de Dados** | PostgreSQL | Persistência de dados |

### Nível 3 — Componente (Backend)

A API é organizada em camadas:

- **Controllers** — Recebem as requisições HTTP e delegam para os services
- **Services** — Contêm as regras de negócio (score, insights, previsão, gamificação)
- **Middlewares** — Validação JWT, tratamento de erros
- **Prisma Client** — Acesso ao banco de dados

```
Requisição HTTP
      │
      ▼
┌─────────────────┐
│ Middleware Auth  │  ← Valida JWT
└────────┬────────┘
         ▼
┌─────────────────┐
│  Controllers    │  ← Auth, Transaction, Category, Goal, Analytics, Badge
└────────┬────────┘
         ▼
┌─────────────────┐
│   Services      │  ← Regras de negócio (score, insights, forecast, badges)
└────────┬────────┘
         ▼
┌─────────────────┐
│  Prisma Client  │  ← Acesso ao PostgreSQL
└─────────────────┘
```

### Nível 4 — Código (Estrutura de Pastas)

```
GestaoFinancasPessoais/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Handlers HTTP
│   │   ├── services/          # Lógica de negócio
│   │   ├── routes/            # Definição de rotas Express
│   │   ├── middlewares/       # Auth JWT, error handler
│   │   ├── validators/        # Schemas Zod
│   │   ├── utils/             # Helpers (classificação automática)
│   │   ├── prisma/            # Schema e migrations
│   │   └── server.ts          # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Componentes reutilizáveis
    │   ├── pages/             # Páginas da aplicação
    │   ├── hooks/             # Custom hooks
    │   ├── services/          # Chamadas API (Axios)
    │   └── App.tsx
    └── package.json
```

---

##  Tecnologias utilizadas

### Frontend
- React.js + TypeScript
- Vite (build tool)
- TailwindCSS 
- Recharts (gráficos)
- Axios + React Query (HTTP client)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- Zod (validação)

### Banco de Dados
- PostgreSQL

### Autenticação
- JWT + bcrypt

---

##  Roadmap de Desenvolvimento

### Fase 1 — Backend
1. Setup projeto Node.js + Express + TypeScript
2. Configurar Prisma + schema PostgreSQL
3. Autenticação (registro, login, JWT)
4. CRUD de Categorias
5. CRUD de Transações + classificação automática
6. CRUD de Metas
7. Analytics (score, insights, previsão)
8. Gamificação (badges)

### Fase 2 — Frontend
1. Setup React + Vite + TailwindCSS
2. Páginas de Login / Cadastro
3. Dashboard principal
4. Página de Transações
5. Página de Metas
6. Página de Conquistas
7. Polimento e responsividade

---

##  Autor

Victor Henrique Kunz de Souza
Projeto acadêmico — Programação Web, Engenharia de Software - Universidade Católica de Santa Catarina (Joinville)
