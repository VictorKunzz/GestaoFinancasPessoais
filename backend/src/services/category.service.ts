import prisma from "../utils/prisma";

// Categorias visiveis ao usuario: as proprias + as padrao do sistema (userId null)
async function getAll(userId: string) {
  const categorias = await prisma.category.findMany({
    where: { OR: [{ userId }, { isDefault: true }] },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });

  return categorias;
}

async function getById(userId: string, id: string) {
  const categoria = await prisma.category.findUnique({
    where: { id },
  });

  // padrao (visivel a todos) ou pertencente ao usuario
  if (!categoria || (!categoria.isDefault && categoria.userId !== userId)) {
    throw new Error("Categoria nao encontrada");
  }

  return categoria;
}

async function create(userId: string, name: string, icon?: string) {
  const existe = await prisma.category.findFirst({
    where: { name, userId },
  });

  if (existe) {
    throw new Error("Ja existe uma categoria com esse nome");
  }

  const categoria = await prisma.category.create({
    data: {
      name,
      icon: icon || null,
      isDefault: false,
      userId,
    },
  });

  return categoria;
}

async function update(userId: string, id: string, data: { name?: string; icon?: string }) {
  const categoria = await prisma.category.findUnique({
    where: { id },
  });

  if (!categoria) {
    throw new Error("Categoria nao encontrada");
  }

  if (categoria.isDefault) {
    throw new Error("Categorias padrao nao podem ser editadas");
  }

  if (categoria.userId !== userId) {
    throw new Error("Categoria nao encontrada");
  }

  if (data.name && data.name !== categoria.name) {
    const existe = await prisma.category.findFirst({
      where: { name: data.name, userId },
    });

    if (existe && existe.id !== id) {
      throw new Error("Ja existe uma categoria com esse nome");
    }
  }

  const atualizada = await prisma.category.update({
    where: { id },
    data,
  });

  return atualizada;
}

async function remove(userId: string, id: string) {
  const categoria = await prisma.category.findUnique({
    where: { id },
  });

  if (!categoria) {
    throw new Error("Categoria nao encontrada");
  }

  if (categoria.isDefault) {
    throw new Error("Categorias padrao nao podem ser removidas");
  }

  if (categoria.userId !== userId) {
    throw new Error("Categoria nao encontrada");
  }

  const emUso = await prisma.transaction.count({ where: { categoryId: id } });

  if (emUso > 0) {
    throw new Error("Categoria em uso por transacoes e nao pode ser removida");
  }

  await prisma.category.delete({
    where: { id },
  });
}

export default { getAll, getById, create, update, remove };
