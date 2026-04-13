# Guia de Testes Automatizados (Backend)

Este projeto possui um script central de Testes End-to-End (E2E) em Typescript (`test-all.ts`). 
Ele atua como um "usuário fantasma", conectando e enviando requisições reais para verificar todas as regras de negócio em sequência (Autenticação, Transações Inteligentes, Goal-Tracking, Analytics e Gamificação).

O script foi programado de forma dinâmica: Cada execução cria um novo e-mail aleatório baseado no carimbo do relógio. **Dessa forma, você pode rodá-lo infinitas vezes sem medo de colisões ou precisar apagar o banco.**

## Pré-requisitos da Apresentação
Para que os testes funcionem, apenas três coisas devem estar garantidas no seu computador:
1. O Serviço do Banco PostgreSQL rodando no em segundo plano (seja via Docker ou nativo).
2. O banco já deve estar "populado" com os metadados iniciais (já criados pelas migrations e seed).
3. E por último: **A sua API deve estar ligada.** Mantenha um terminal aberto na pasta `backend/` executando:
   ```bash
   npm run dev
   ```

---

## Passo a Passo (Como Rodar e Apresentar)

1. Abra um **segundo** terminal no VS Code (ao lado do terminal que está segurando a API aberta).
2. Entre na pasta correspondente usando `cd backend`.
3. Dispare o comando que compila e roda a validação completa:
   ```bash
   npx ts-node test-all.ts
   ```

4. Acompanhe os checmarks verdes ✅. O script navegará validando:
   - Cadastros e logins retornando JWT Válidos.
   - Detecção se ao gastar dinheiro no "McDonalds" ele vai para categoria "Alimentação".
   - Detecção matemática do Motor de Saúde Financeira.
   - Checagem automática do sistema de troféus e gamificação.

No final, todas as regras sendo atendidas exibirão o Troféu indicando 100% de precisão de sucesso na API.

## Descrevendo os Resultados
Para conferir a persistência localmente, veja os relatórios indo até o Prisma:
```bash
npx prisma studio
```
Navegando lá dentro, as tabelas `Transaction` e `User` devem conter com exatidão os dados fakes gerados no teste.
