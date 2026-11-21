import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { especieInputSchema } from "@/lib/validaciones/especie.schema";
import { crearEspecie, listarEspecies } from "@/services/especies.service";

const handlers = crearManejadoresColeccion({
  schema: especieInputSchema,
  listar: listarEspecies,
  crear: crearEspecie,
  nombreColeccion: "especies",
  mensajeCarga: "No se pudo cargar el catálogo de especies.",
  mensajeGuardado: "No se pudo guardar la especie.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
