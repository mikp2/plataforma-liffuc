import { aislamientoInputSchema } from "@/lib/validaciones/aislamiento.schema";
import { crearManejadoresColeccion } from "@/lib/api/coleccion-cientifica";
import { crearAislamiento, listarAislamientos } from "@/services/aislamientos.service";

const handlers = crearManejadoresColeccion({
  schema: aislamientoInputSchema,
  listar: listarAislamientos,
  crear: crearAislamiento,
  nombreColeccion: "aislamientos",
  mensajeCarga: "No se pudo cargar el catálogo de aislamientos.",
  mensajeGuardado: "No se pudo guardar el aislamiento.",
});

export const GET = handlers.GET;
export const POST = handlers.POST;
