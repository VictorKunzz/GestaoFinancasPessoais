import dotenv from "dotenv";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

dotenv.config();

// Cria a conexao com o banco usando o driver pg
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Categorias padrao que vem com o sistema
const categoriasPadrao = [
  { name: "Alimentacao", isDefault: true },
  { name: "Transporte", isDefault: true },
  { name: "Moradia", isDefault: true },
  { name: "Saude", isDefault: true },
  { name: "Educacao", isDefault: true },
  { name: "Lazer", isDefault: true },
  { name: "Vestuario", isDefault: true },
  { name: "Salario", isDefault: true },
  { name: "Freelance", isDefault: true },
  { name: "Outros", isDefault: true },
];

// Medalhas disponiveis no sistema
const medalhas = [
  {
    name: "Primeira Transacao",
    description: "Registrou sua primeira transacao",
    condition: "first_transaction",
  },
  {
    name: "Meta Criada",
    description: "Criou sua primeira meta financeira",
    condition: "first_goal",
  },
  {
    name: "Meta Atingida",
    description: "Atingiu uma meta financeira",
    condition: "goal_reached",
  },
  {
    name: "Mes no Azul",
    description: "Terminou um mes com saldo positivo",
    condition: "positive_month",
  },
  {
    name: "Economista",
    description: "Gastou menos que o mes anterior",
    condition: "spent_less",
  },
];

async function main() {
  console.log("Criando categorias padrao...");

  for (const categoria of categoriasPadrao) {
    await prisma.category.upsert({
      where: { name: categoria.name },
      update: {},
      create: categoria,
    });
  }

  console.log("Categorias criadas!");

  console.log("Criando medalhas...");

  for (const medalha of medalhas) {
    // Verifica se ja existe uma medalha com essa condicao
    const existe = await prisma.badge.findFirst({
      where: { condition: medalha.condition },
    });

    if (!existe) {
      await prisma.badge.create({ data: medalha });
    }
  }

  console.log("Medalhas criadas!");
  console.log("Seed finalizado!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
