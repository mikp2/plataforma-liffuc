import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { muestraBotanicaInputSchema } from "@/lib/validaciones/muestra-botanica.schema";
import { crearMuestra, listarMuestras } from "@/services/muestras.service";

const handlers = crearManejadoresColeccion({
  schema: muestraBotanicaInputSchema,
  listar: listarMuestras,
  crear: crearMuestra,
  nombreColeccion: "muestras",
  mensajeCarga: "No se pudo cargar el catálogo de muestras botánicas.",
  mensajeGuardado: "No se pudo guardar la muestra botánica.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
