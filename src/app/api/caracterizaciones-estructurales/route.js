import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { caracterizacionEstructuralInputSchema } from "@/lib/validaciones/caracterizacion-estructural.schema";
import { crearCaracterizacion, listarCaracterizaciones } from "@/services/caracterizaciones.service";

const handlers = crearManejadoresColeccion({
  schema: caracterizacionEstructuralInputSchema,
  listar: listarCaracterizaciones,
  crear: crearCaracterizacion,
  nombreColeccion: "caracterizaciones",
  mensajeCarga: "No se pudo cargar el catálogo de caracterizaciones estructurales.",
  mensajeGuardado: "No se pudo guardar la caracterización estructural.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
