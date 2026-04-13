# Documento de Requisitos

Sistema de controle financeiro pessoal com dashboard visual, insights automáticos, score de saúde financeira, previsão de saldo e gamificação.

**Objetivo:** Ajudar o usuário a controlar sua vida financeira de forma visual, simples e inteligente, mostrando não só os gastos, mas também insights e previsões sobre seus hábitos financeiros.

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

## Funcionalidades Diferenciadas (Regras de Negócio Iniciais)

### 1. Score de saúde financeira
Um número de 0 a 100 que mostra o quão saudável estão suas finanças, calculado com base em: relação receita/despesa, regularidade de depósitos em metas e ausência de meses no vermelho.

### 2. Insights automáticos
O sistema analisa seus dados e mostra informações dinâmicas:
- "Você gastou mais do que o normal esse mês"
- "Seu maior gasto foi com alimentação"
- "Se continuar assim, seu saldo acaba em X dias"

### 3. Previsão de saldo
Projeção do saldo futuro para 30, 60 e 90 dias, baseado na média de receitas e despesas dos últimos 3 meses.

### 4. Metas com previsão de conclusão
O sistema calcula em quanto tempo você consegue atingir uma meta financeira, baseado no seu ritmo atual de economia.

### 5. Classificação automática de gastos
Se o usuário digitar palavras predefinidas (ex: "Uber", "McDonalds"), o sistema classifica automaticamente na categoria correta (Transporte, Alimentação, etc).

### 6. Gamificação
Pequenos incentivos como medalhas, metas atingidas e evolução mês a mês para estimular bons hábitos financeiros.
