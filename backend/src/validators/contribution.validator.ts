import { z } from "zod";

export const createContributionSchema = z.object({
  amount: z.number().positive("O valor do aporte deve ser maior que zero"),
  note: z.string().max(200, "Nota muito longa").optional(),
  date: z.string().optional(),
});
