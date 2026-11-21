import { z } from "zod";

const optionalText = (max = 1000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const referenciaBibliograficaInputSchema = z.object({
  titulo: z.string().trim().min(1).max(1000),
  autores: optionalText(10000),
  anio: z.number().int().min(1400).max(2500).nullable().optional(),
  revista: optionalText(500),
  volumen: optionalText(80),
  numero: optionalText(80),
  paginas: optionalText(120),
  doi: z.string().trim().min(1).max(255).nullable().optional(),
  url: z.string().trim().url().max(2048).nullable().optional(),
});
