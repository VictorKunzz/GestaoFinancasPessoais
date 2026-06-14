import { z } from "zod";
import { BadgeCondition } from "../generated/prisma/enums";

export const checkBadgeSchema = z.object({
  condition: z.nativeEnum(BadgeCondition),
});
