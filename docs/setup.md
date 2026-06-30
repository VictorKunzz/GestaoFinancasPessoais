# Como Instalar e Rodar o Projeto

Este documento funciona como um **Runbook** com os passos necessários para configurar o ambiente do desenvolvedor e iniciar as camadas do sistema localmente.

## Pré-requisitos
* Node.js v18+ 
* PostgreSQL rodando localmente (ou via Docker)
* Git

---

## 1. Configurando o Banco de Dados (PostgreSQL)

Antes de iniciar a aplicação, você precisa ter uma base de dados pronta para aceitar conexões.
É possível utilizar containers Docker para isso. Exemplo com comando docker:
```bash
docker run --name db-financas -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```

## 2. Configurando o Backend (API)

Acesse a pasta correspondente e instale as dependências:
```bash
cd backend
npm install
```

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz da pasta `backend` baseado no modelo [`backend/.env.example`](../backend/.env.example). Ele define a porta da API, a chave do JWT e a string de conexão do Prisma.

Exemplo de `.env`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:docker@localhost:5432/financas_pessoais?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
```

> O nome do banco no `DATABASE_URL` (`financas_pessoais`) é criado automaticamente pelo `prisma migrate dev`; basta que as credenciais e a porta batam com o PostgreSQL em execução.

Variáveis opcionais aceitas pela API (ver `backend/src/config/env.ts`):
* `NODE_ENV` — padrão `development`.
* `CORS_ORIGIN` — lista de origens permitidas separadas por vírgula (vazio libera todas em dev).
* `JSON_BODY_LIMIT` — limite do corpo das requisições (padrão `100kb`).

### Migrations e Seed
Ainda na pasta `backend`, popule o schema do banco e adicione os dados iniciais:
```bash
npx prisma migrate dev --name init
npm run seed
```

### Execução da API
```bash
npm run dev
```
O servidor deverá iniciar com logs similares a:
> Servidor rodando em http://localhost:3000
> Health check: http://localhost:3000/api/health

> O `npm run seed` também cria um usuário administrador padrão: **`admin@fintrack.com`** / **`admin123`**.

---

## 3. Configurando o Frontend
Em um segundo terminal, acesse a pasta do frontend e instale as dependências:
```bash
cd frontend
npm install
npm run dev
```

O app React sobe em `http://localhost:5173`. O Vite faz proxy de todas as chamadas a `/api` para a API em `http://localhost:3000` (configurado em `frontend/vite.config.ts`), então não é necessário configurar URL de API manualmente em desenvolvimento.

Para gerar o build de produção: `npm run build` (saída em `dist/`) e `npm run preview` para pré-visualizar.
