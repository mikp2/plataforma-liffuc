import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();
const optionalNonNegativeNumber = z.number().finite().min(0).nullable().optional();

export const extractoInputSchema = z.object({
  codigo: z.string().trim().min(1).max(60),
  identificacionId: z.string().trim().min(1).max(128),
  metodoExtraccion: z.string().trim().min(1).max(300),
  solvente: z.string().trim().min(1).max(300),
  parteVegetal: optionalText(180),
  temperaturaC: z.number().finite().nullable().optional(),
  duracionMinutos: z.number().int().min(0).nullable().optional(),
  masaInicialMg: optionalNonNegativeNumber,
  masaExtractoMg: optionalNonNegativeNumber,
  rendimientoPct: z.number().finite().min(0).max(100).nullable().optional(),
  condiciones: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
});