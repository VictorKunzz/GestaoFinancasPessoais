import { z } from "zod";

export const checkBadgeSchema = z.object({
  condition: z.string().min(1, "Condição é obrigatória"),
});
