import dotenv from "dotenv";
import pg from "pg";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { BadgeCondition, Role } from "../src/generated/prisma/enums";

dotenv.config();

// Cria a conexao com o banco usando o driver pg
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Categorias padrao que vem com o sistema (userId null = globais).
// icon = slug de um icone lucide (renderizado via lib/icons no frontend).
const categoriasPadrao = [
  { name: "Alimentacao", icon: "utensils" },
  { name: "Transporte", icon: "car" },
  { name: "Moradia", icon: "home" },
  { name: "Saude", icon: "heart-pulse" },
  { name: "Educacao", icon: "graduation-cap" },
  { name: "Lazer", icon: "gamepad-2" },
  { name: "Vestuario", icon: "shirt" },
  { name: "Salario", icon: "banknote" },
  { name: "Freelance", icon: "briefcase" },
  { name: "Investimentos", icon: "line-chart" },
  { name: "Outros", icon: "ellipsis" },
];

// Medalhas disponiveis no sistema (condition usa o enum BadgeCondition).
// O icone exibido e derivado da condition no frontend; o slug aqui serve de fallback.
const medalhas = [
  {
    name: "Primeira Transacao",
    description: "Registrou sua primeira transacao",
    icon: "zap",
    condition: BadgeCondition.FIRST_TRANSACTION,
  },
  {
    name: "Meta Criada",
    description: "Criou sua primeira meta financeira",
    icon: "target",
    condition: BadgeCondition.FIRST_GOAL,
  },
  {
    name: "Meta Atingida",
    description: "Atingiu uma meta financeira",
    icon: "trophy",
    condition: BadgeCondition.GOAL_REACHED,
  },
  {
    name: "Mes no Azul",
    description: "Terminou um mes com saldo positivo",
    icon: "trending-up",
    condition: BadgeCondition.POSITIVE_MONTH,
  },
  {
    name: "Economista",
    description: "Gastou menos que o mes anterior",
    icon: "piggy-bank",
    condition: BadgeCondition.SPENT_LESS,
  },
];

async function main() {
  console.log("Criando categorias padrao...");

  for (const categoria of categoriasPadrao) {
    const existe = await prisma.category.findFirst({
      where: { name: categoria.name, userId: null },
    });

    if (!existe) {
      await prisma.category.create({
        data: { name: categoria.name, icon: categoria.icon, isDefault: true },
      });
    } else if (existe.icon !== categoria.icon) {
      // Atualiza icones legados (emojis) para slugs lucide
      await prisma.category.update({
        where: { id: existe.id },
        data: { icon: categoria.icon },
      });
    }
  }

  console.log("Categorias criadas!");

  console.log("Criando medalhas...");

  for (const medalha of medalhas) {
    const existe = await prisma.badge.findFirst({
      where: { condition: medalha.condition },
    });

    if (!existe) {
      await prisma.badge.create({ data: medalha });
    } else if (existe.icon !== medalha.icon) {
      // Atualiza icones legados (emojis) para slugs lucide
      await prisma.badge.update({
        where: { id: existe.id },
        data: { icon: medalha.icon },
      });
    }
  }

  console.log("Medalhas criadas!");

  console.log("Garantindo usuario administrador...");

  const adminEmail = "admin@fintrack.com";
  const adminExistente = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExistente) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
    console.log(`Admin criado: ${adminEmail} / admin123`);
  } else if (adminExistente.role !== Role.ADMIN) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: Role.ADMIN },
    });
    console.log("Usuario existente promovido a ADMIN.");
  } else {
    console.log("Admin ja existe.");
  }

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
