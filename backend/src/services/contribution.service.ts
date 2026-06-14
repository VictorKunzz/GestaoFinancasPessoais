import prisma from "../utils/prisma";
import badgeService from "./badge.service";
import { BadgeCondition } from "../generated/prisma/enums";

async function garanteMetaDoUsuario(userId: string, goalId: string) {
  const meta = await prisma.goal.findUnique({ where: { id: goalId } });

  if (!meta || meta.userId !== userId) {
    throw new Error("Meta nao encontrada");
  }

  return meta;
}

async function list(userId: string, goalId: string) {
  await garanteMetaDoUsuario(userId, goalId);

  return prisma.goalContribution.findMany({
    where: { goalId },
    orderBy: { date: "desc" },
  });
}

async function create(
  userId: string,
  goalId: string,
  data: { amount: number; note?: string; date?: string }
) {
  await garanteMetaDoUsuario(userId, goalId);

  const [contribuicao, meta] = await prisma.$transaction([
    prisma.goalContribution.create({
      data: {
        goalId,
        userId,
        amount: data.amount,
        note: data.note || null,
        date: data.date ? new Date(data.date) : new Date(),
      },
    }),
    prisma.goal.update({
      where: { id: goalId },
      data: { savedAmount: { increment: data.amount } },
    }),
  ]);

  // Conquista de meta atingida (avaliada apos atualizar o savedAmount)
  const badge = await badgeService.checkAndAwardBadge(userId, BadgeCondition.GOAL_REACHED);

  return { contribution: contribuicao, goal: meta, badge };
}

async function remove(userId: string, goalId: string, contributionId: string) {
  const meta = await garanteMetaDoUsuario(userId, goalId);

  const contribuicao = await prisma.goalContribution.findUnique({
    where: { id: contributionId },
  });

  if (!contribuicao || contribuicao.goalId !== goalId) {
    throw new Error("Aporte nao encontrado");
  }

  const novoSaved = Math.max(0, Number(meta.savedAmount) - Number(contribuicao.amount));

  const [, metaAtualizada] = await prisma.$transaction([
    prisma.goalContribution.delete({ where: { id: contributionId } }),
    prisma.goal.update({
      where: { id: goalId },
      data: { savedAmount: novoSaved },
    }),
  ]);

  return { goal: metaAtualizada };
}

export default { list, create, remove };
