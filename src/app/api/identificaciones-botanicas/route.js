import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { identificacionBotanicaInputSchema } from "@/lib/validaciones/identificacion-botanica.schema";
import { crearIdentificacion, listarIdentificaciones } from "@/services/identificaciones.service";

const handlers = crearManejadoresColeccion({
  schema: identificacionBotanicaInputSchema,
  listar: listarIdentificaciones,
  crear: crearIdentificacion,
  nombreColeccion: "identificaciones",
  mensajeCarga: "No se pudo cargar el catálogo de identificaciones botánicas.",
  mensajeGuardado: "No se pudo guardar la identificación botánica.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
