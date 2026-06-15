import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().toLowerCase().email("Email invalido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(72, "Senha muito longa")
    .regex(/[A-Za-z]/, "Senha deve conter ao menos uma letra")
    .regex(/[0-9]/, "Senha deve conter ao menos um numero"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email invalido"),
  password: z.string().min(1, "Senha e obrigatoria"),
});
