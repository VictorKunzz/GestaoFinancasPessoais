import { z } from "zod";
import { Role, BadgeCondition } from "../generated/prisma/enums";

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const createBadgeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().min(2, "Descrição deve ter pelo menos 2 caracteres"),
  icon: z.string().optional(),
  condition: z.nativeEnum(BadgeCondition),
});

export const updateBadgeSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  description: z.string().min(2, "Descrição deve ter pelo menos 2 caracteres").optional(),
  icon: z.string().optional(),
  condition: z.nativeEnum(BadgeCondition).optional(),
});
