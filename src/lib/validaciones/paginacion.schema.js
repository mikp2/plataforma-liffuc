import { z } from "zod";

export const paginacionSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().trim().min(1).max(128).optional(),
});
