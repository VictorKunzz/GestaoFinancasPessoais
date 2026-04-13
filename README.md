# Gestão de Finanças Pessoais

Projeto desenvolvido para a disciplina de Programação Web no curso de Engenharia de Software.

Sistema de controle financeiro pessoal com dashboard visual, insights automáticos, score de saúde financeira, previsão de saldo e gamificação.

---

## Objetivo

Ajudar o usuário a controlar sua vida financeira de forma visual, simples e inteligente, mostrando não só os gastos, mas também **insights e previsões** sobre seus hábitos financeiros.

---

## Documentação do Projeto

Toda a documentação técnica, estrutural e de regras de negócio do sistema foi separada em arquivos específicos para melhor manutenção. Acesse a pasta [`docs/`](./docs/):

- [Requisitos e Regras de Negócios](./docs/requirements.md): Lista de requisitos funcionais, não-funcionais e detalhamento das lógicas do sistema (Score de saúde, insights automáticos).
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
├──.vscode/
│   └── settings.json          # Configurações do VS Code
│
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
├── frontend/
│   ├── src/                  # Inicialização pendente
│   └── package.json
│
└── docs/                     # Documentação de Engenharia de Software
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

### Fase 1 - Backend
1. Setup projeto Node.js + Express + TypeScript
2. Configurar Prisma + schema PostgreSQL
3. Autenticação (registro, login, JWT)
4. CRUD de Categorias
5. CRUD de Transações + classificação automática
6. CRUD de Metas
7. Analytics (score, insights, previsão)
8. Gamificação (badges)

### Fase 2 - Frontend
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
