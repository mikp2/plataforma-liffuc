import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const especieInputSchema = z.object({
  nombreCientifico: z.string().trim().min(2).max(180),
  autorTaxonomico: optionalText(300),
  genero: optionalText(120),
  familia: optionalText(180),
  nombreComun: optionalText(180),
  descripcion: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
});