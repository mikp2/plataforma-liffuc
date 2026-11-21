import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();
const optionalDate = z.coerce.date().nullable().optional();

export const identificacionBotanicaInputSchema = z.object({
  muestraId: z.string().trim().min(1).max(128),
  especieId: z.string().trim().min(1).max(128),
  identificadoPor: optionalText(300),
  fechaIdentificacion: optionalDate,
  metodo: optionalText(300),
  esVigente: z.boolean().default(true),
  notas: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
});
