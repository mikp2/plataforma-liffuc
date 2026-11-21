import { z } from "zod";

const optionalText = z.string().trim().max(10000).nullable().optional();
const optionalStructure = z.string().trim().max(10000).transform((value) => value || null).nullable().optional();
const optionalIdentifier = (max) => z.string().trim().max(max).transform((value) => value || null).nullable().optional();
const optionalInchiKey = z.string().trim().max(40).transform((value) => value ? value.toUpperCase() : null).nullable().optional();

export const moleculeInputSchema = z.object({
  codigo: z.string().trim().min(1).max(40),
  nombre: z.string().trim().min(1).max(180),
  formula: z.string().trim().max(120).nullable().optional(),
  pesoMolecular: z.number().positive().nullable().optional(),
  smilesCanonico: optionalStructure,
  inchi: optionalStructure,
  inchiKey: optionalInchiKey,
  numeroCas: optionalIdentifier(32),
  especie: z.string().trim().min(1).max(180),
  familia: z.string().trim().max(180).nullable().optional(),
  origen: z.string().trim().max(300).nullable().optional(),
  descripcion: z.string().trim().min(1).max(10000),
  actividad: optionalText,
  metodoObtencion: optionalText,
  referencias: optionalText,
  referenciaIds: z.array(z.string().trim().min(1).max(128)).max(30).optional(),
  estado: z.enum(["BORRADOR", "EN_REVISION", "APROBADA", "PUBLICADA"]),
});

export const moleculeUpdateSchema = moleculeInputSchema.omit({ referenciaIds: true }).partial().refine(
  (value) => Object.keys(value).length > 0,
  "Debes enviar al menos un campo para actualizar.",
);

export function serializeMolecule(molecule) {
  return {
    ...molecule,
    archivos: molecule.archivos.map((file) => ({
      id: file.id,
      nombre: file.nombre,
      tipo: file.tipo,
      mimeType: file.mimeType,
      tamano: file.tamano,
      createdAt: file.createdAt,
      url: `/api/moleculas/${encodeURIComponent(molecule.codigo)}/archivos/${encodeURIComponent(file.id)}`,
    })),
  };
}
