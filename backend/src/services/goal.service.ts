import prisma from "../utils/prisma";

async function getAll(userId: string) {
  const metas = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return metas;
}

async function getById(userId: string, id: string) {
  const meta = await prisma.goal.findUnique({
    where: { id },
  });

  if (!meta || meta.userId !== userId) {
    throw new Error("Meta nao encontrada");
  }

  return meta;
}

async function create(userId: string, data: {
  name: string;
  targetAmount: number;
  savedAmount?: number;
  deadline?: string;
}) {
  const meta = await prisma.goal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      savedAmount: data.savedAmount || 0,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  return meta;
}

async function update(userId: string, id: string, data: {
  name?: string;
  targetAmount?: number;
  savedAmount?: number;
  deadline?: string;
}) {
  const meta = await prisma.goal.findUnique({
    where: { id },
  });

  if (!meta || meta.userId !== userId) {
    throw new Error("Meta nao encontrada");
  }

  const updateData: any = {};

  if (data.name) updateData.name = data.name;
  if (data.targetAmount) updateData.targetAmount = data.targetAmount;
  if (data.savedAmount !== undefined) updateData.savedAmount = data.savedAmount;
  if (data.deadline) updateData.deadline = new Date(data.deadline);

  const atualizada = await prisma.goal.update({
    where: { id },
    data: updateData,
  });

  return atualizada;
}

async function remove(userId: string, id: string) {
  const meta = await prisma.goal.findUnique({
    where: { id },
  });

  if (!meta || meta.userId !== userId) {
    throw new Error("Meta nao encontrada");
  }

  await prisma.goal.delete({
    where: { id },
  });
}

export default { getAll, getById, create, update, remove };
