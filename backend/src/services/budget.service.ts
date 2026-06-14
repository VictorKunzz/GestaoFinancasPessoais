import prisma from "../utils/prisma";

// Garante que a categoria existe e e visivel ao usuario (propria ou padrao do sistema)
async function garanteCategoriaVisivel(userId: string, categoryId: string) {
  const categoria = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!categoria || (!categoria.isDefault && categoria.userId !== userId)) {
    throw new Error("Categoria nao encontrada");
  }
  return categoria;
}

// Soma das despesas do usuario, por categoria, no mes corrente
async function gastosDoMesPorCategoria(userId: string): Promise<Record<string, number>> {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);

  const agrupado = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type: "EXPENSE", date: { gte: inicioMes, lte: fimMes } },
    _sum: { amount: true },
  });

  const mapa: Record<string, number> = {};
  agrupado.forEach((g) => {
    mapa[g.categoryId] = Number(g._sum.amount ?? 0);
  });
  return mapa;
}

async function list(userId: string) {
  const [orcamentos, gastos] = await Promise.all([
    prisma.budget.findMany({
      where: { userId },
      include: { category: { select: { id: true, name: true, icon: true } } },
      orderBy: { createdAt: "desc" },
    }),
    gastosDoMesPorCategoria(userId),
  ]);

  return orcamentos.map((b) => {
    const limite = Number(b.monthlyLimit);
    const gasto = gastos[b.categoryId] ?? 0;
    const percentual = limite > 0 ? Math.round((gasto / limite) * 100) : 0;
    return {
      id: b.id,
      categoryId: b.categoryId,
      category: b.category,
      monthlyLimit: limite,
      spent: Math.round(gasto * 100) / 100,
      percentage: percentual,
      exceeded: gasto > limite,
    };
  });
}

async function create(userId: string, categoryId: string, monthlyLimit: number) {
  await garanteCategoriaVisivel(userId, categoryId);

  const existe = await prisma.budget.findUnique({
    where: { userId_categoryId: { userId, categoryId } },
  });

  if (existe) {
    throw new Error("Ja existe um orcamento para esta categoria");
  }

  return prisma.budget.create({
    data: { userId, categoryId, monthlyLimit },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });
}

async function update(userId: string, id: string, monthlyLimit: number) {
  const orcamento = await prisma.budget.findUnique({ where: { id } });
  if (!orcamento || orcamento.userId !== userId) {
    throw new Error("Orcamento nao encontrado");
  }

  return prisma.budget.update({
    where: { id },
    data: { monthlyLimit },
    include: { category: { select: { id: true, name: true, icon: true } } },
  });
}

async function remove(userId: string, id: string) {
  const orcamento = await prisma.budget.findUnique({ where: { id } });
  if (!orcamento || orcamento.userId !== userId) {
    throw new Error("Orcamento nao encontrado");
  }

  await prisma.budget.delete({ where: { id } });
}

export default { list, create, update, remove };
