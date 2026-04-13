import prisma from "../utils/prisma";

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

async function checkAndAwardBadge(userId: string, condition: string) {

  const medalha = await prisma.badge.findFirst({
    where: { condition },
  });

  if (!medalha) return null;

  const jaPossui = await prisma.userBadge.findFirst({
    where: {
      userId,
      badgeId: medalha.id,
    },
  });

  if (jaPossui) return null;

  let mereceMedalha = false;

  if (condition === "first_transaction") {
    const transacoes = await prisma.transaction.count({ where: { userId } });
    if (transacoes >= 1) mereceMedalha = true;
  } 
  else if (condition === "first_goal") {
    const metas = await prisma.goal.count({ where: { userId } });
    if (metas >= 1) mereceMedalha = true;
  }
  else if (condition === "goal_reached") {

    const metasAtingidas = await prisma.goal.findFirst({
      where: {
        userId,
        savedAmount: { gte: prisma.goal.fields.targetAmount }
      } as any
    });
    
    const todasMetas = await prisma.goal.findMany({ where: { userId } });
    const atingiuAlguma = todasMetas.some(m => Number(m.savedAmount) >= Number(m.targetAmount));
    
    if (atingiuAlguma) mereceMedalha = true;
  }
  else if (condition === "positive_month" || condition === "spent_less") {
    mereceMedalha = true;
  }

  if (mereceMedalha) {
    const conquista = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: medalha.id,
      },
      include: { badge: true },
    });
    
    return {
      awarded: true,
      badge: conquista.badge,
    };
  }

  return { awarded: false };
}

export default { getAllBadges, getUserBadges, checkAndAwardBadge };
