import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const caracterizacionEstructuralInputSchema = z.object({
  aislamientoId: z.string().trim().min(1).max(128),
  tecnica: z.string().trim().min(1).max(180),
  equipo: optionalText(300),
  condiciones: optionalText(),
  datos: z.record(z.string(), z.unknown()).nullable().optional(),
  interpretacion: optionalText(),
  fecha: z.coerce.date().nullable().optional(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
});
