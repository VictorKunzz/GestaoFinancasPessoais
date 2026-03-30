import prisma from "../utils/prisma";

// Lista todas as medalhas do sistema e marca quais o usuario ja tem
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

// Retorna apenas as medalhas que o usuario ja conquistou
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

// Funcao para ser chamada no backend quando uma acao acontece para checar se ganhou medalha
async function checkAndAwardBadge(userId: string, condition: string) {
  // Procura a medalha pela condicao
  const medalha = await prisma.badge.findFirst({
    where: { condition },
  });

  if (!medalha) return null; // Condicao nao existe como medalha

  // Verifica se o usuario ja tem essa medalha
  const jaPossui = await prisma.userBadge.findFirst({
    where: {
      userId,
      badgeId: medalha.id,
    },
  });

  if (jaPossui) return null; // Ja tem a medalha, nao faz nada

  // Logica especifica para cada condicao (vamos validar se ele realmente merece antes de dar)
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
    // Procura alguma meta onde o valor salvo seja >= valor alvo
    const metasAtingidas = await prisma.goal.findFirst({
      where: {
        userId,
        savedAmount: { gte: prisma.goal.fields.targetAmount }
      } as any // o prisma nao aceita comparacao de colunas diretamente no findFirst sem raw de forma simples, vamos pegar todas e checar no map
    });
    
    // Contorno para a limitacao do Prisma de comparar colunas
    const todasMetas = await prisma.goal.findMany({ where: { userId } });
    const atingiuAlguma = todasMetas.some(m => Number(m.savedAmount) >= Number(m.targetAmount));
    
    if (atingiuAlguma) mereceMedalha = true;
  }
  else if (condition === "positive_month" || condition === "spent_less") {
    // Para fins didaticos, vamos confiar que se a rota chamou essas condicoes especificas de fechamento de mes, ele mereceu.
    // Em um sistema real, isso rodaria num CRON (job agendado todo dia 1).
    mereceMedalha = true;
  }

  // Se merecer, a gente da a medalha
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
