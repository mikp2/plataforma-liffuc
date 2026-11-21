import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const aislamientoInputSchema = z.object({
  codigoMuestra: optionalText(180),
  fraccionId: z.string().trim().min(1).max(128),
  moleculaId: z.string().trim().min(1).max(128),
  metodo: z.string().trim().min(1).max(300),
  purezaPct: z.number().finite().min(0).max(100).nullable().optional(),
  masaAisladaMg: z.number().finite().min(0).nullable().optional(),
  fechaAislamiento: z.coerce.date().nullable().optional(),
  observaciones: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
});
