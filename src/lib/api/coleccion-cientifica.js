import { NextResponse } from "next/server";
import { authorizeRequest, MOLECULE_EDITOR_ROLES } from "@/lib/authorization";
import { paginacionSchema } from "@/lib/validaciones/paginacion.schema";
import { ErrorValidacionCientifica } from "@/services/errores-cientificos.service";

export function crearManejadoresColeccion({
  schema,
  listar,
  crear,
  nombreColeccion,
  mensajeCarga,
  mensajeGuardado,
}) {
  return {
    async GET(request) {
      const { response } = await authorizeRequest();
      if (response) return response;

      const searchParams = new URL(request.url).searchParams;
      const paginacion = paginacionSchema.safeParse({
        limit: searchParams.get("limit") ?? undefined,
        cursor: searchParams.get("cursor") ?? undefined,
      });
      if (!paginacion.success) {
        return NextResponse.json(
          { message: "Los parámetros de paginación no son válidos.", errors: paginacion.error.flatten() },
          { status: 400 },
        );
      }

      try {
        const pagina = await listar(paginacion.data);
        return NextResponse.json({ [nombreColeccion]: pagina.items, nextCursor: pagina.nextCursor, hasMore: pagina.hasMore });
      } catch (error) {
        return responderError(error, `No se pudo consultar ${nombreColeccion}.`, mensajeCarga);
      }
    },

    async POST(request) {
      const { response } = await authorizeRequest(MOLECULE_EDITOR_ROLES);
      if (response) return response;

      let body;
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
      }

      const parsed = schema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Revisa los campos del formulario.", errors: parsed.error.flatten() },
          { status: 400 },
        );
      }

      try {
        const registro = await crear(parsed.data);
        return NextResponse.json(registro, { status: 201 });
      } catch (error) {
        return responderError(error, `No se pudo crear un registro de ${nombreColeccion}.`, mensajeGuardado);
      }
    },
  };
}

function responderError(error, mensajeLog, mensajeError) {
  if (error instanceof ErrorValidacionCientifica) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  if (error?.code === "P2002") {
    return NextResponse.json({ message: "Ya existe un registro con uno de esos identificadores." }, { status: 409 });
  }
  if (error?.code === "P2003" || error?.code === "P2004" || error?.code === "P2025") {
    return NextResponse.json({ message: "Uno o más registros relacionados no existen o incumplen una regla de integridad." }, { status: 400 });
  }

  console.error(mensajeLog, error);
  return NextResponse.json({ message: mensajeError }, { status: 500 });
}
