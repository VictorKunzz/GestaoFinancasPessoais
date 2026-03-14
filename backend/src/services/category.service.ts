import prisma from "../utils/prisma";

async function getAll() {
  const categorias = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return categorias;
}

async function getById(id: string) {
  const categoria = await prisma.category.findUnique({
    where: { id },
  });

  if (!categoria) {
    throw new Error("Categoria nao encontrada");
  }

  return categoria;
}

async function create(name: string, icon?: string) {
  const existe = await prisma.category.findUnique({
    where: { name },
  });

  if (existe) {
    throw new Error("Ja existe uma categoria com esse nome");
  }

  const categoria = await prisma.category.create({
    data: {
      name,
      icon: icon || null,
      isDefault: false,
    },
  });

  return categoria;
}

async function update(id: string, data: { name?: string; icon?: string }) {
  const categoria = await prisma.category.findUnique({
    where: { id },
  });

  if (!categoria) {
    throw new Error("Categoria nao encontrada");
  }

  if (categoria.isDefault) {
    throw new Error("Categorias padrao nao podem ser editadas");
  }

  if (data.name) {
    const existe = await prisma.category.findUnique({
      where: { name: data.name },
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

async function remove(id: string) {
  const categoria = await prisma.category.findUnique({
    where: { id },
  });

  if (!categoria) {
    throw new Error("Categoria nao encontrada");
  }

  if (categoria.isDefault) {
    throw new Error("Categorias padrao nao podem ser removidas");
  }

  await prisma.category.delete({
    where: { id },
  });
}

export default { getAll, getById, create, update, remove };
