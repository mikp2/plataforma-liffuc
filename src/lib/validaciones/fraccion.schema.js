import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const fraccionInputSchema = z.object({
  codigo: z.string().trim().min(1).max(60),
  extractoId: z.string().trim().min(1).max(128),
  fraccionPadreId: z.string().trim().min(1).max(128).nullable().optional(),
  metodoFraccionamiento: z.string().trim().min(1).max(300),
  faseEstacionaria: optionalText(300),
  eluyente: optionalText(1000),
  orden: z.number().int().min(0).nullable().optional(),
  masaMg: z.number().finite().min(0).nullable().optional(),
  notas: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
});