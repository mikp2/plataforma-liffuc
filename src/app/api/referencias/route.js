import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { referenciaBibliograficaInputSchema } from "@/lib/validaciones/referencia-bibliografica.schema";
import { crearReferencia, listarReferencias } from "@/services/referencias.service";

const handlers = crearManejadoresColeccion({
  schema: referenciaBibliograficaInputSchema,
  listar: listarReferencias,
  crear: crearReferencia,
  nombreColeccion: "referencias",
  mensajeCarga: "No se pudo cargar la bibliografía.",
  mensajeGuardado: "No se pudo guardar la referencia bibliográfica.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
