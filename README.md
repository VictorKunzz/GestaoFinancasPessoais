# Gestão de Finanças Pessoais

Projeto desenvolvido para a disciplina de Programação Web no curso de Engenharia de Software.

Sistema de controle financeiro pessoal com dashboard visual, insights automáticos, score de saúde financeira, previsão de saldo e gamificação.

---

## Objetivo

Ajudar o usuário a controlar sua vida financeira de forma visual, simples e inteligente, mostrando não só os gastos, mas também **insights e previsões** sobre seus hábitos financeiros.

---

## Documentação do Projeto

Toda a documentação técnica, estrutural e de regras de negócio do sistema foi separada em arquivos específicos para melhor manutenção. Acesse a pasta [`docs/`](./docs/):

- [Requisitos e Regras de Negócios](./docs/requisitos.md): Lista de requisitos funcionais, não-funcionais e detalhamento das lógicas do sistema (Score de saúde, insights automáticos).
- [Guia de Instalação e Execução](./docs/setup.md): Tutorial prático de como rodar as frentes do projeto em ambiente local (Backend/Frontend).
- [Dicionário de Dados](./docs/database.md): Detalhamento de todas as tabelas, tipos e relacionamentos baseados no esquema do banco.
- [Documentação da API](./docs/api.md): Especificações das rotas HTTP, métodos e regras de consumo do back-end.
- [Rotinas de Testes](./docs/testing.md): Tutorial do script de validação e apresentações E2E das lógicas do servidor.

### Arquitetura (Modelo C4)

Os diagramas arquiteturais do sistema foram construídos utilizando o **Modelo C4** e a linguagem **PlantUML**.
Eles detalham os níveis de Contexto, Container, Componentes e o Diagrama de Entidade-Relacionamento do banco de dados.

- [O código de todos os diagramas podem ser consultados no diretório `docs/plantuml/`](./docs/plantuml/)
- [Os diagramas gerados a partir do código podem ser consultadas no diretório `docs/c4-model/`](./docs/c4-model/)

---

## Estrutura de Pastas

```
GestaoFinancasPessoais/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Histórico de migrations
│   │   ├── schema.prisma     # Modelo de dados (Prisma)
│   │   └── seed.ts           # Carga inicial (categorias, badges, admin)
│   ├── src/
│   │   ├── controllers/      # Handlers HTTP
│   │   ├── services/         # Lógica de negócio
│   │   ├── routes/           # Definição de rotas Express
│   │   ├── middlewares/      # Auth JWT, admin, segurança, rate limit
│   │   ├── validators/       # Schemas Zod
│   │   ├── utils/            # Helpers (ex.: classificação automática)
│   │   ├── config/           # Configuração de ambiente (env)
│   │   └── server.ts         # Entry point da API
│   ├── test-all.ts           # Script de testes E2E
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes (dashboard, transações, metas, etc.)
│   │   ├── pages/            # Páginas (login, dashboard, metas, admin...)
│   │   ├── services/         # Clientes da API (Axios)
│   │   ├── hooks/            # Hooks customizados
│   │   ├── contexts/         # Context API (ex.: autenticação)
│   │   ├── types/            # Tipagens TypeScript
│   │   ├── lib/              # Utilitários (ex.: ícones)
│   │   └── main.tsx          # Entry point do React
│   ├── vite.config.ts        # Dev server (porta 5173) + proxy /api
│   └── package.json
│
└── docs/                     # Documentação de Engenharia de Software
```

---

##  Tecnologias utilizadas

### Frontend
- React.js 19 + TypeScript
- Vite (build tool)
- TailwindCSS v4
- React Router (roteamento)
- Recharts (gráficos)
- Axios (HTTP client)
- lucide-react (ícones)

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- Zod (validação)

### Banco de Dados
- PostgreSQL

### Autenticação
- JWT + bcrypt

---

## Como Executar (Quickstart)

Passo a passo para subir o projeto completo (banco + API + frontend) em ambiente local.

### Pré-requisitos
- Node.js v18+
- PostgreSQL rodando localmente (ou via Docker)
- Git

### 1. Subir o banco de dados (PostgreSQL)
Exemplo usando Docker:
```bash
docker run --name db-financas -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

### 2. Backend (API)
```bash
cd backend
npm install
```
Crie um arquivo `.env` na pasta `backend/` baseado em [`backend/.env.example`](./backend/.env.example):
```env
PORT=3000
DATABASE_URL="postgresql://postgres:docker@localhost:5432/financas_pessoais?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
```
Rode as migrations, popule os dados iniciais e inicie a API:
```bash
npx prisma migrate dev --name init
npm run seed
npm run dev
```
A API sobe em `http://localhost:3000` (health check em `http://localhost:3000/api/health`).

### 3. Frontend (App React)
Em um segundo terminal:
```bash
cd frontend
npm install
npm run dev
```
Abra `http://localhost:5173` no navegador. As chamadas a `/api` são automaticamente encaminhadas para a API na porta 3000 (proxy do Vite).

### 4. Acessar o sistema
- Registre um novo usuário pela tela de cadastro, **ou**
- Use o administrador criado pelo seed:
  - **E-mail:** `admin@fintrack.com`
  - **Senha:** `admin123`

---

## Como Usar

1. **Cadastro / Login:** crie uma conta ou entre com um usuário existente. A sessão é mantida via token JWT.
2. **Transações:** registre receitas, despesas e investimentos. A descrição é usada para **classificação automática** por palavra-chave (ex.: uma compra no "McDonalds" é sugerida na categoria "Alimentação").
3. **Categorias:** use as categorias padrão do sistema ou crie categorias personalizadas.
4. **Metas:** defina objetivos financeiros (valor alvo e prazo) e acompanhe o progresso conforme guarda dinheiro.
5. **Orçamentos:** estabeleça limites mensais de gasto por categoria e receba alertas ao se aproximar do limite.
6. **Dashboard & Analytics:** acompanhe saldo, receitas/despesas, gráficos por categoria, **score de saúde financeira (0–100)**, **insights automáticos** e **previsão de saldo** futura.
7. **Conquistas (Gamificação):** desbloqueie medalhas ao atingir marcos (primeira transação, primeira meta, meta atingida, mês no azul, gastar menos que o mês anterior).
8. **Administração (perfil ADMIN):** gerencie usuários (listar, promover a admin, remover) e o catálogo de medalhas do sistema.

---

## Como Testar

O projeto possui um script central de testes End-to-End (E2E) que envia requisições reais à API validando todas as regras de negócio em sequência (autenticação, classificação de transações, score de saúde, gamificação). Cada execução gera um e-mail único, então pode ser rodado várias vezes sem limpar o banco.

**Pré-requisitos:** banco PostgreSQL rodando, migrations + seed aplicados e a **API ligada** (`npm run dev`).

Com a API no ar, em um segundo terminal:
```bash
cd backend
npx ts-node test-all.ts
```
Acompanhe os checkmarks verdes ✅; ao final, o troféu indica 100% de sucesso.

Para inspecionar os dados persistidos:
```bash
cd backend
npx prisma studio
```

No frontend, é possível rodar o linter:
```bash
cd frontend
npm run lint
```

Detalhes completos em [`docs/testing.md`](./docs/testing.md).

---

##  Roadmap de Desenvolvimento

### Fase 1 - Backend ✅
1. Setup projeto Node.js + Express + TypeScript
2. Configurar Prisma + schema PostgreSQL
3. Autenticação (registro, login, JWT)
4. CRUD de Categorias
5. CRUD de Transações + classificação automática
6. CRUD de Metas
7. Analytics (score, insights, previsão)
8. Gamificação (badges)

### Fase 2 - Frontend ✅
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
Projeto acadêmico - Programação Web, Engenharia de Software - Universidade Católica de Santa Catarina (Joinville)
