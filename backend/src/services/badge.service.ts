import prisma from "../utils/prisma";
import { BadgeCondition } from "../generated/prisma/enums";

async function getAllBadges(userId: string) {
  const todasMedalhas = await prisma.badge.findMany();

  const usuarioMedalhas = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const idsConquistadas = new Set(usuarioMedalhas.map((um) => um.badgeId));

  const resultado = todasMedalhas.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    icon: m.icon,
    condition: m.condition,
    earned: idsConquistadas.has(m.id),
    earnedAt: idsConquistadas.has(m.id)
      ? usuarioMedalhas.find((um) => um.badgeId === m.id)?.earnedAt
      : null,
  }));

  return resultado;
}

async function getUserBadges(userId: string) {
  const usuarioMedalhas = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });

  return usuarioMedalhas.map((um) => ({
    id: um.badge.id,
    name: um.badge.name,
    description: um.badge.description,
    icon: um.badge.icon,
    earnedAt: um.earnedAt,
  }));
}

async function somaPorTipo(userId: string, tipo: "INCOME" | "EXPENSE", inicio: Date, fim: Date) {
  const resultado = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      userId,
      type: tipo as any,
      goalId: null,
      date: { gte: inicio, lt: fim },
    },
  });

  return Number(resultado._sum.amount ?? 0);
}

async function avaliaCondicao(userId: string, condition: BadgeCondition): Promise<boolean> {
  switch (condition) {
    case BadgeCondition.FIRST_TRANSACTION: {
      const total = await prisma.transaction.count({ where: { userId } });
      return total >= 1;
    }
    case BadgeCondition.FIRST_GOAL: {
      const total = await prisma.goal.count({ where: { userId } });
      return total >= 1;
    }
    case BadgeCondition.GOAL_REACHED: {
      const metas = await prisma.goal.findMany({ where: { userId } });
      return metas.some((m) => Number(m.savedAmount) >= Number(m.targetAmount));
    }
    case BadgeCondition.POSITIVE_MONTH: {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const inicioProxMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
      const receitas = await somaPorTipo(userId, "INCOME", inicioMes, inicioProxMes);
      const despesas = await somaPorTipo(userId, "EXPENSE", inicioMes, inicioProxMes);
      return receitas > 0 && receitas > despesas;
    }
    case BadgeCondition.SPENT_LESS: {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      const inicioProxMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);
      const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1);
      const despesasMes = await somaPorTipo(userId, "EXPENSE", inicioMes, inicioProxMes);
      const despesasAnterior = await somaPorTipo(userId, "EXPENSE", inicioMesAnterior, inicioMes);
      // So premia quando houve gasto no mes anterior e o mes atual foi menor.
      return despesasAnterior > 0 && despesasMes < despesasAnterior;
    }
    default:
      return false;
  }
}

async function checkAndAwardBadge(userId: string, condition: BadgeCondition) {
  const medalha = await prisma.badge.findFirst({
    where: { condition },
  });

  if (!medalha) return null;

  const jaPossui = await prisma.userBadge.findFirst({
    where: { userId, badgeId: medalha.id },
  });

  if (jaPossui) return null;

  const mereceMedalha = await avaliaCondicao(userId, condition);

  if (mereceMedalha) {
    const conquista = await prisma.userBadge.create({
      data: { userId, badgeId: medalha.id },
      include: { badge: true },
    });

    return { awarded: true, badge: conquista.badge };
  }

  return { awarded: false };
}

export default { getAllBadges, getUserBadges, checkAndAwardBadge };
