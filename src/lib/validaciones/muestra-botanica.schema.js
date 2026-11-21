import { z } from "zod";

const optionalText = (max = 5000) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();

export const muestraBotanicaInputSchema = z.object({
  numeroVoucher: optionalText(180),
  herbario: optionalText(180),
  colector: optionalText(300),
  fechaRecoleccion: z.coerce.date().nullable().optional(),
  pais: optionalText(120),
  localidad: optionalText(),
  latitud: z.number().finite().min(-90).max(90).nullable().optional(),
  longitud: z.number().finite().min(-180).max(180).nullable().optional(),
  parteVegetal: optionalText(180),
  notas: optionalText(),
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
}).superRefine((value, context) => {
  const hasLatitude = value.latitud !== undefined && value.latitud !== null;
  const hasLongitude = value.longitud !== undefined && value.longitud !== null;
  if (hasLatitude !== hasLongitude) {
    context.addIssue({
      code: "custom",
      message: "La latitud y la longitud deben proporcionarse juntas.",
      path: ["latitud"],
    });
  }
});
