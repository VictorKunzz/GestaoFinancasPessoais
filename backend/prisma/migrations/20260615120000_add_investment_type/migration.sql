-- Adiciona o tipo de transação INVESTMENT ao enum TransactionType.
-- Investimentos passam a ser modelados como um tipo próprio (distinto de receita/despesa)
-- para que recebam tratamento e destaque especiais na dashboard.
ALTER TYPE "TransactionType" ADD VALUE IF NOT EXISTS 'INVESTMENT';
