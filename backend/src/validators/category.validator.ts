import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  icon: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  icon: z.string().optional(),
});
