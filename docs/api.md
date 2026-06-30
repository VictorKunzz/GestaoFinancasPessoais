# Documentação da API

O back-end do sistema foi construído em `Node.js + Express`, e utiliza arquitetura RESTful. 
Todas as rotas da API possuem o base path `/api`.

Em um cenário avançado, recomenda-se a substituição / adição desta documentação via Swagger (OpenAPI) para gerar uma interface interativa.

## Autenticação (JWT)
A maioria das rotas do sistema requer um token JWT válido enviando no Header da requisição:
```http
Authorization: Bearer <seu-token-jwt>
```

---

## 1. Auth (`/api/auth`)
* `POST /api/auth/register` - Cadastra um novo usuário passando `{ name, email, password }`. Retorna o usuário criado e um token.
* `POST /api/auth/login` - Autentica um usuário existente passando `{ email, password }`. Retorna os dados do usuário logado e um token.
* `GET /api/auth/me` - Retorna as informações do usuário logado. Baseia-se no token passado.

## 2. Categorias (`/api/categories`)
* `GET /api/categories` - Lista todas as categorias padrão e as personalizadas do usuário.
* `POST /api/categories` - Cria uma nova categoria personalizada. Requer `{ name, icon }`.
* `PUT /api/categories/:id` - Atualiza uma categoria específica (se permitida).
* `DELETE /api/categories/:id` - Deleta uma categoria.

## 3. Transações (`/api/transactions`)
* `GET /api/transactions` - Retorna a lista de transações com suporte a query params (`?month=`, `?year=`, `?type=`, etc).
* `POST /api/transactions` - Cria uma transação: `{ categoryId, type, description, amount, date }`. O campo `type` aceita `INCOME` (receita), `EXPENSE` (despesa) ou `INVESTMENT` (investimento).
* `GET /api/transactions/:id` - Busca os detalhes de uma transação pelo ID.
* `PUT /api/transactions/:id` - Edita os dados de uma transação.
* `DELETE /api/transactions/:id` - Remove a transação do sistema.

## 4. Metas Financeiras (`/api/goals`)
* `GET /api/goals` - Retorna todas as metas do usuário.
* `POST /api/goals` - Cria uma meta financeira com `{ name, targetAmount, deadline }`.
* `PUT /api/goals/:id` - Adiciona valor na meta (`savedAmount`) ou edita informações.
* `DELETE /api/goals/:id` - Deleta a meta.

## 5. Analytics & Dashboard (`/api/analytics`)
Rotas específicas para alimentar a página de dashboard e inteligência da aplicação.
* `GET /api/analytics/summary` - Calcula e traz Receitas, Despesas e Saldo do período atual.
* `GET /api/analytics/category-expenses` - Traz o resumo dos gastos fatiados por categorias para o gráfico de pizza.
* `GET /api/analytics/financial-health` - Retorna a pontuação de 0 a 100 de saúde financeira.
* `GET /api/analytics/insights` - Gera e retorna frases de insights automáticos com base no comportamento recente.
* `GET /api/analytics/forecast` - Retorna as previsões matemáticas de saldo futuro projetados.

## 6. Gamificação & Medalhas (`/api/badges`)
* `GET /api/badges/user` - Lista todas as medalhas que o usuário possui.
* `GET /api/badges/available` - Lista sistema de medalhas geral.
* `POST /api/badges/check` (ou acionamentos internos via hooks) - Verifica se o usuário ganhou alguma medalha nova baseada em ações recentes.

## 7. Orçamentos (`/api/budgets`)
* `GET /api/budgets` - Lista os orçamentos (limites mensais por categoria) do usuário.
* `POST /api/budgets` - Cria um orçamento mensal para uma categoria.
* `PUT /api/budgets/:id` - Atualiza um orçamento existente.
* `DELETE /api/budgets/:id` - Remove um orçamento.

## 8. Administração (`/api/admin`)
Rotas restritas a usuários com papel `ADMIN` (exigem autenticação + middleware de admin).
* `GET /api/admin/users` - Lista todos os usuários do sistema.
* `PUT /api/admin/users/:id/role` - Altera o papel de um usuário (ex.: promover a `ADMIN`).
* `DELETE /api/admin/users/:id` - Remove um usuário.
* `GET /api/admin/badges` - Lista o catálogo de medalhas.
* `POST /api/admin/badges` - Cria uma nova medalha.
* `PUT /api/admin/badges/:id` - Edita uma medalha.
* `DELETE /api/admin/badges/:id` - Remove uma medalha.

## 9. Health Check (`/api/health`)
* `GET /api/health` - Rota pública que retorna o status da API (`status`, `timestamp`, `uptime`). Útil para monitoramento e para validar que o servidor está no ar.
