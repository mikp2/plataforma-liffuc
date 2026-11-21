import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { extractoInputSchema } from "@/lib/validaciones/extracto.schema";
import { crearExtracto, listarExtractos } from "@/services/extractos.service";

const handlers = crearManejadoresColeccion({
  schema: extractoInputSchema,
  listar: listarExtractos,
  crear: crearExtracto,
  nombreColeccion: "extractos",
  mensajeCarga: "No se pudo cargar el catálogo de extractos.",
  mensajeGuardado: "No se pudo guardar el extracto.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
