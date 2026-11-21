import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarCaracterizaciones(paginacion) {
  return consultarPagina(
    (args) => prisma.caracterizacionEstructural.findMany(args),
    paginacion,
    {
      include: {
        aislamiento: {
          include: { molecula: { select: { id: true, codigo: true, nombre: true } } },
        },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearCaracterizacion(data) {
  const { referenciaIds, ...caracterizacion } = data;
  return prisma.caracterizacionEstructural.create({
    data: { ...caracterizacion, ...conectarReferencias(referenciaIds) },
    include: {
      aislamiento: {
        include: { molecula: { select: { id: true, codigo: true, nombre: true } } },
      },
      referenciasBibliograficas: true,
    },
  });
}
