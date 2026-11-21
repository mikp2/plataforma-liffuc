import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { bioensayoInputSchema } from "@/lib/validaciones/bioensayo.schema";
import { crearBioensayo, listarBioensayos } from "@/services/bioensayos.service";

const handlers = crearManejadoresColeccion({
  schema: bioensayoInputSchema,
  listar: listarBioensayos,
  crear: crearBioensayo,
  nombreColeccion: "bioensayos",
  mensajeCarga: "No se pudo cargar el catálogo de bioensayos.",
  mensajeGuardado: "No se pudo guardar el bioensayo.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
