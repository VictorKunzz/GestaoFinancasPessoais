import dotenv from "dotenv";

dotenv.config();

// Le uma variavel obrigatoria; falha o boot se estiver ausente (evita segredos default inseguros).
function obrigatoria(nome: string): string {
  const valor = process.env[nome];
  if (!valor) {
    throw new Error(
      `Variavel de ambiente obrigatoria ausente: ${nome}. Defina-a no arquivo .env do backend.`
    );
  }
  return valor;
}

export const env = {
  JWT_SECRET: obrigatoria("JWT_SECRET"),
  DATABASE_URL: obrigatoria("DATABASE_URL"),
  PORT: process.env.PORT || "3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  // Origens permitidas no CORS (separadas por virgula). Vazio = libera tudo (apenas dev).
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  // Limite do corpo das requisicoes JSON.
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || "100kb",
};
