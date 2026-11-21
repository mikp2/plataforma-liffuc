import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarAislamientos(paginacion) {
  return consultarPagina(
    (args) => prisma.aislamiento.findMany(args),
    paginacion,
    {
      include: {
        fraccion: { select: { id: true, codigo: true, extractoId: true } },
        molecula: { select: { id: true, codigo: true, nombre: true } },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearAislamiento(data) {
  const { referenciaIds, ...aislamiento } = data;
  return prisma.aislamiento.create({
    data: { ...aislamiento, ...conectarReferencias(referenciaIds) },
    include: {
      fraccion: { select: { id: true, codigo: true, extractoId: true } },
      molecula: { select: { id: true, codigo: true, nombre: true } },
      referenciasBibliograficas: true,
    },
  });
}
