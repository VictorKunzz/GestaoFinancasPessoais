import prisma from "../utils/prisma";

const palavrasChave: Record<string, string[]> = {
  Alimentacao: ["mercado", "supermercado", "mercado", "restaurante", "lanche", "comida", "padaria", "acai", "pizza", "ifood", "alimento"],
  Transporte: ["gasolina", "combustivel", "uber", "onibus", "estacionamento", "pedagio", "carro", "moto", "ipva"],
  Moradia: ["aluguel", "condominio", "luz", "agua", "energia", "internet", "iptu", "casa", "apartamento"],
  Saude: ["farmacia", "medico", "hospital", "remedio", "consulta", "dentista", "exame", "plano de saude"],
  Educacao: ["curso", "faculdade", "livro", "escola", "material", "mensalidade", "apostila"],
  Lazer: ["cinema", "netflix", "spotify", "jogo", "viagem", "passeio", "show", "festa", "bar"],
  Vestuario: ["roupa", "calcado", "tenis", "camisa", "calca", "blusa", "sapato", "nike", "camiseta", "shorts", "bermuda"],
  Salario: ["salario", "pagamento", "contracheque", "remuneracao", "proventos"],
  Freelance: ["freelance", "freela", "projeto", "servico", "consultoria", "trabalho extra"],
};

function classificarCategoria(descricao: string): string | null {
  const descricaoLower = descricao.toLowerCase();

  for (const [categoria, palavras] of Object.entries(palavrasChave)) {
    for (const palavra of palavras) {
      if (descricaoLower.includes(palavra)) {
        return categoria;
      }
    }
  }

  return null;
}

// Confirma que a meta existe e pertence ao usuario. Vinculo so e permitido em despesas (aportes).
async function garanteMetaDoUsuario(userId: string, goalId: string) {
  const meta = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!meta || meta.userId !== userId) {
    throw new Error("Meta nao encontrada");
  }
  return meta;
}

async function getAll(userId: string, filtros?: {
  type?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const where: any = { userId };

  if (filtros?.type) {
    where.type = filtros.type;
  }

  if (filtros?.categoryId) {
    where.categoryId = filtros.categoryId;
  }

  if (filtros?.search) {
    where.description = { contains: filtros.search, mode: "insensitive" };
  }

  if (filtros?.startDate || filtros?.endDate) {
    where.date = {};
    if (filtros.startDate) where.date.gte = new Date(filtros.startDate);
    if (filtros?.endDate) where.date.lte = new Date(filtros.endDate);
  }

  const page = Math.max(1, filtros?.page ?? 1);
  const limit = Math.min(100, Math.max(1, filtros?.limit ?? 20));
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true, goal: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getById(userId: string, id: string) {
  const transacao = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true, goal: { select: { id: true, name: true } } },
  });

  if (!transacao || transacao.userId !== userId) {
    throw new Error("Transacao nao encontrada");
  }

  return transacao;
}

async function create(userId: string, data: {
  categoryId?: string;
  goalId?: string | null;
  type: string;
  description: string;
  amount: number;
  date: string;
}) {
  // Aporte: so despesa pode ser vinculada a uma meta
  const goalId = data.type === "EXPENSE" ? data.goalId ?? null : null;
  if (goalId) {
    await garanteMetaDoUsuario(userId, goalId);
  }

  let categoryId = data.categoryId;

  if (!categoryId) {
    // Investimentos tem categoria propria e dedicada; demais tipos usam o classificador por palavra-chave
    const nomeCategoria =
      data.type === "INVESTMENT" ? "Investimentos" : classificarCategoria(data.description);

    if (nomeCategoria) {
      const categoria = await prisma.category.findFirst({
        where: { name: nomeCategoria, userId: null },
      });

      if (categoria) {
        categoryId = categoria.id;
      }
    }

    if (!categoryId) {
      const outros = await prisma.category.findFirst({
        where: { name: "Outros", userId: null },
      });

      if (outros) {
        categoryId = outros.id;
      }
    }
  }

  if (!categoryId) {
    throw new Error("Categoria nao encontrada");
  }

  const transacao = await prisma.$transaction(async (tx) => {
    const criada = await tx.transaction.create({
      data: {
        userId,
        categoryId,
        goalId,
        type: data.type as any,
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
      },
      include: { category: true, goal: { select: { id: true, name: true } } },
    });

    // Aporte alimenta o valor economizado da meta
    if (goalId) {
      await tx.goal.update({
        where: { id: goalId },
        data: { savedAmount: { increment: data.amount } },
      });
    }

    return criada;
  });

  return transacao;
}

// Ajusta o valor economizado de uma meta por um delta, sem deixar ficar negativo.
async function ajustaSaved(tx: any, goalId: string, delta: number) {
  const meta = await tx.goal.findUnique({ where: { id: goalId } });
  if (!meta) return;
  const novo = Math.max(0, Number(meta.savedAmount) + delta);
  await tx.goal.update({ where: { id: goalId }, data: { savedAmount: novo } });
}

async function update(userId: string, id: string, data: {
  categoryId?: string;
  goalId?: string | null;
  type?: string;
  description?: string;
  amount?: number;
  date?: string;
}) {
  const transacao = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transacao || transacao.userId !== userId) {
    throw new Error("Transacao nao encontrada");
  }

  const oldGoalId = transacao.goalId;
  const oldAmount = Number(transacao.amount);
  const newType = data.type ?? transacao.type;
  const newAmount = data.amount ?? oldAmount;

  // Vinculo de meta so vale para despesa; mudar para receita desfaz o aporte
  let newGoalId: string | null;
  if (newType !== "EXPENSE") {
    newGoalId = null;
  } else if (data.goalId !== undefined) {
    newGoalId = data.goalId;
  } else {
    newGoalId = oldGoalId;
  }

  if (newGoalId) {
    await garanteMetaDoUsuario(userId, newGoalId);
  }

  const updateData: any = { goalId: newGoalId };

  if (data.categoryId) updateData.categoryId = data.categoryId;
  if (data.type) updateData.type = data.type;
  if (data.description) updateData.description = data.description;
  if (data.amount) updateData.amount = data.amount;
  if (data.date) updateData.date = new Date(data.date);

  const atualizada = await prisma.$transaction(async (tx) => {
    if (oldGoalId) await ajustaSaved(tx, oldGoalId, -oldAmount);
    if (newGoalId) await ajustaSaved(tx, newGoalId, newAmount);

    return tx.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true, goal: { select: { id: true, name: true } } },
    });
  });

  return atualizada;
}

async function remove(userId: string, id: string) {
  const transacao = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transacao || transacao.userId !== userId) {
    throw new Error("Transacao nao encontrada");
  }

  const goalId = transacao.goalId;
  const valor = Number(transacao.amount);

  await prisma.$transaction(async (tx) => {
    // Remover um aporte reduz o valor economizado da meta
    if (goalId) await ajustaSaved(tx, goalId, -valor);
    await tx.transaction.delete({ where: { id } });
  });
}

export default { getAll, getById, create, update, remove };
