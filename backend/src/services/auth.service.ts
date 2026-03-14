import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta-padrao";

async function register(name: string, email: string, password: string) {

  const usuarioExistente = await prisma.user.findUnique({
    where: { email },
  });

  if (usuarioExistente) {
    throw new Error("Email ja esta em uso");
  }


  const passwordHash = await bcrypt.hash(password, 10);


  const usuario = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
  });


  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    createdAt: usuario.createdAt,
  };
}


async function login(email: string, password: string) {

  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new Error("Email ou senha incorretos");
  }

  const senhaCorreta = await bcrypt.compare(password, usuario.passwordHash);

  if (!senhaCorreta) {
    throw new Error("Email ou senha incorretos");
  }

  const token = jwt.sign({ userId: usuario.id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    token,
    user: {
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
    },
  };
}


async function getProfile(userId: string) {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!usuario) {
    throw new Error("Usuario nao encontrado");
  }

  return {
    id: usuario.id,
    name: usuario.name,
    email: usuario.email,
    createdAt: usuario.createdAt,
  };
}

export default { register, login, getProfile };
