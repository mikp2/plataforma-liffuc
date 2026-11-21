import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();
const optionalNonNegativeNumber = z.number().finite().min(0).nullable().optional();

export const resultadoBioensayoInputSchema = z.object({
  extractoId: z.string().trim().min(1).max(128).nullable().optional(),
  fraccionId: z.string().trim().min(1).max(128).nullable().optional(),
  moleculaId: z.string().trim().min(1).max(128).nullable().optional(),
  concentracion: optionalNonNegativeNumber,
  unidadConcentracion: z.string().trim().min(1).max(80).nullable().optional(),
  valor: z.number().finite().nullable().optional(),
  unidadResultado: z.string().trim().min(1).max(120).nullable().optional(),
  desviacionEstandar: optionalNonNegativeNumber,
  replicados: z.number().int().positive().nullable().optional(),
  interpretacion: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
}).superRefine((value, context) => {
  const materialCount = [value.extractoId, value.fraccionId, value.moleculaId]
    .filter((id) => typeof id === "string" && id.length > 0).length;
  if (materialCount !== 1) {
    context.addIssue({
      code: "custom",
      message: "Cada resultado debe referirse a exactamente un extracto, fracción o molécula.",
      path: ["extractoId"],
    });
  }
  const hasConcentration = value.concentracion !== undefined && value.concentracion !== null;
  const hasConcentrationUnit = Boolean(value.unidadConcentracion);
  if (hasConcentration !== hasConcentrationUnit) {
    context.addIssue({
      code: "custom",
      message: "La concentración y su unidad deben proporcionarse juntas.",
      path: ["concentracion"],
    });
  }
  const hasValue = value.valor !== undefined && value.valor !== null;
  const hasResultUnit = Boolean(value.unidadResultado);
  if (hasValue !== hasResultUnit) {
    context.addIssue({
      code: "custom",
      message: "El valor del resultado y su unidad deben proporcionarse juntos.",
      path: ["valor"],
    });
  }
  if (!hasValue && !value.interpretacion?.trim()) {
    context.addIssue({
      code: "custom",
      message: "El resultado requiere un valor medido o una interpretación cualitativa.",
      path: ["valor"],
    });
  }
});

export const bioensayoInputSchema = z.object({
  codigo: z.string().trim().min(1).max(60),
  tipo: z.enum(["FARMACOLOGICO", "TOXICOLOGICO", "OTRO"]),
  objetivo: z.string().trim().min(1).max(500),
  modeloExperimental: optionalText(300),
  organismoModelo: optionalText(300),
  protocolo: optionalText(),
  endpoint: optionalText(300),
  condiciones: optionalText(),
  fechaInicio: z.coerce.date().nullable().optional(),
  fechaFin: z.coerce.date().nullable().optional(),
  resultados: z.array(resultadoBioensayoInputSchema).max(500).optional(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
}).superRefine((value, context) => {
  if (value.fechaInicio && value.fechaFin && value.fechaFin < value.fechaInicio) {
    context.addIssue({
      code: "custom",
      message: "La fecha de término no puede ser anterior a la fecha de inicio.",
      path: ["fechaFin"],
    });
  }
});