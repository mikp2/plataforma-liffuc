import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { fraccionInputSchema } from "@/lib/validaciones/fraccion.schema";
import { crearFraccion, listarFracciones } from "@/services/fracciones.service";

const handlers = crearManejadoresColeccion({
  schema: fraccionInputSchema,
  listar: listarFracciones,
  crear: crearFraccion,
  nombreColeccion: "fracciones",
  mensajeCarga: "No se pudo cargar el catálogo de fracciones.",
  mensajeGuardado: "No se pudo guardar la fracción.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
