import { z } from "zod";

export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Categoria obrigatoria"),
  monthlyLimit: z.number().positive("O limite deve ser maior que zero"),
});

export const updateBudgetSchema = z.object({
  monthlyLimit: z.number().positive("O limite deve ser maior que zero"),
});
