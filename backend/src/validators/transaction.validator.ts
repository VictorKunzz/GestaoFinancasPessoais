import { z } from "zod";

export const createTransactionSchema = z.object({
  categoryId: z.string().uuid("ID da categoria invalido").optional(),
  type: z.enum(["INCOME", "EXPENSE"], { message: "Tipo deve ser INCOME ou EXPENSE" }),
  description: z.string().min(1, "Descricao e obrigatoria"),
  amount: z.number().positive("Valor deve ser positivo"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data invalida"),
});

export const updateTransactionSchema = z.object({
  categoryId: z.string().uuid("ID da categoria invalido").optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  description: z.string().min(1, "Descricao e obrigatoria").optional(),
  amount: z.number().positive("Valor deve ser positivo").optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Data invalida").optional(),
});
