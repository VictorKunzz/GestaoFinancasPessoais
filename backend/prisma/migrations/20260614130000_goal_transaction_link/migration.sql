-- DropForeignKey: remove vinculos da antiga tabela de aportes
ALTER TABLE "GoalContribution" DROP CONSTRAINT "GoalContribution_goalId_fkey";

-- DropForeignKey
ALTER TABLE "GoalContribution" DROP CONSTRAINT "GoalContribution_userId_fkey";

-- DropTable: aportes agora sao transacoes de despesa vinculadas a meta
DROP TABLE "GoalContribution";

-- AlterTable: transacao opcionalmente vinculada a uma meta (aporte)
ALTER TABLE "Transaction" ADD COLUMN "goalId" TEXT;

-- AddForeignKey: ao apagar a meta, a transacao permanece (vinculo zerado)
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
