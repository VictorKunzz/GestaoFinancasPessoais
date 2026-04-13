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
Copie ou crie um arquivo `.env` na raiz da pasta `backend` baseando-se no que for necessário para configurar a porta da API, a chave do JWT e a string de conexão do Prisma.

Exemplo de `.env`:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:docker@localhost:5432/financas?schema=public"
JWT_SECRET="sua_chave_secreta_de_desenvolvimento_aqui"
```

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

---

## 3. Configurando o Frontend (Em fase de construção)
Na Fase 2 de desenvolvimento apontada pelo Roadmap, a pasta `frontend` existirá. Os passos comuns serão:
```bash
cd frontend
npm install
npm run dev
```

O App React então se conectará à URL base da API via `localhost:3000`.
