import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  targetAmount: z.number().positive("Valor alvo deve ser positivo"),
  savedAmount: z.number().min(0, "Valor economizado nao pode ser negativo").optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Data invalida").optional(),
});

export const updateGoalSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  targetAmount: z.number().positive("Valor alvo deve ser positivo").optional(),
  savedAmount: z.number().min(0, "Valor economizado nao pode ser negativo").optional(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), "Data invalida").optional(),
});
