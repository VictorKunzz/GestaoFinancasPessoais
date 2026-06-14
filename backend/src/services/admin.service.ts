import prisma from "../utils/prisma";
import { Role, BadgeCondition } from "../generated/prisma/enums";

// ===== Usuários =====
async function listUsers() {
  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: { transactions: true, goals: true },
      },
    },
  });

  return usuarios.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    transactionsCount: u._count.transactions,
    goalsCount: u._count.goals,
  }));
}

async function updateUserRole(adminId: string, userId: string, role: Role) {
  if (adminId === userId) {
    throw new Error("Voce nao pode alterar o seu proprio papel");
  }

  const usuario = await prisma.user.findUnique({ where: { id: userId } });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  const atualizado = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return atualizado;
}

async function removeUser(adminId: string, userId: string) {
  if (adminId === userId) {
    throw new Error("Voce nao pode remover a sua propria conta");
  }

  const usuario = await prisma.user.findUnique({ where: { id: userId } });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  // Ordem explicita por causa das FKs restritivas (Transaction/Goal/Budget/UserBadge -> User).
  await prisma.$transaction([
    prisma.userBadge.deleteMany({ where: { userId } }),
    prisma.goalContribution.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.budget.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.category.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

// ===== Badges =====
async function listBadges() {
  return prisma.badge.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { userBadges: true } } },
  });
}

async function createBadge(data: {
  name: string;
  description: string;
  icon?: string;
  condition: BadgeCondition;
}) {
  return prisma.badge.create({
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon || null,
      condition: data.condition,
    },
  });
}

async function updateBadge(
  id: string,
  data: { name?: string; description?: string; icon?: string; condition?: BadgeCondition }
) {
  const badge = await prisma.badge.findUnique({ where: { id } });

  if (!badge) {
    throw new Error("Badge nao encontrada");
  }

  return prisma.badge.update({
    where: { id },
    data,
  });
}

async function removeBadge(id: string) {
  const badge = await prisma.badge.findUnique({ where: { id } });

  if (!badge) {
    throw new Error("Badge nao encontrada");
  }

  await prisma.$transaction([
    prisma.userBadge.deleteMany({ where: { badgeId: id } }),
    prisma.badge.delete({ where: { id } }),
  ]);
}

export default {
  listUsers,
  updateUserRole,
  removeUser,
  listBadges,
  createBadge,
  updateBadge,
  removeBadge,
};
