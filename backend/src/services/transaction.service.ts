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

async function getAll(userId: string, filtros?: { type?: string; categoryId?: string; startDate?: string; endDate?: string }) {
  const where: any = { userId };

  if (filtros?.type) {
    where.type = filtros.type;
  }

  if (filtros?.categoryId) {
    where.categoryId = filtros.categoryId;
  }

  if (filtros?.startDate || filtros?.endDate) {
    where.date = {};
    if (filtros.startDate) where.date.gte = new Date(filtros.startDate);
    if (filtros?.endDate) where.date.lte = new Date(filtros.endDate);
  }

  const transacoes = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });

  return transacoes;
}

async function getById(userId: string, id: string) {
  const transacao = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!transacao || transacao.userId !== userId) {
    throw new Error("Transacao nao encontrada");
  }

  return transacao;
}

async function create(userId: string, data: {
  categoryId?: string;
  type: string;
  description: string;
  amount: number;
  date: string;
}) {
  let categoryId = data.categoryId;

  if (!categoryId) {
    const nomeCategoria = classificarCategoria(data.description);

    if (nomeCategoria) {
      const categoria = await prisma.category.findUnique({
        where: { name: nomeCategoria },
      });

      if (categoria) {
        categoryId = categoria.id;
      }
    }

    if (!categoryId) {
      const outros = await prisma.category.findUnique({
        where: { name: "Outros" },
      });

      if (outros) {
        categoryId = outros.id;
      }
    }
  }

  if (!categoryId) {
    throw new Error("Categoria nao encontrada");
  }

  const transacao = await prisma.transaction.create({
    data: {
      userId,
      categoryId,
      type: data.type as any,
      description: data.description,
      amount: data.amount,
      date: new Date(data.date),
    },
    include: { category: true },
  });

  return transacao;
}

async function update(userId: string, id: string, data: {
  categoryId?: string;
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

  const updateData: any = {};

  if (data.categoryId) updateData.categoryId = data.categoryId;
  if (data.type) updateData.type = data.type;
  if (data.description) updateData.description = data.description;
  if (data.amount) updateData.amount = data.amount;
  if (data.date) updateData.date = new Date(data.date);

  const atualizada = await prisma.transaction.update({
    where: { id },
    data: updateData,
    include: { category: true },
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

  await prisma.transaction.delete({
    where: { id },
  });
}

export default { getAll, getById, create, update, remove };
