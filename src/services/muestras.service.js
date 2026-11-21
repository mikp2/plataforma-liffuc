import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarMuestras(paginacion) {
  return consultarPagina(
    (args) => prisma.muestraBotanica.findMany(args),
    paginacion,
    {
      include: {
        _count: { select: { identificaciones: true } },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearMuestra(data) {
  const { referenciaIds, ...muestra } = data;
  return prisma.muestraBotanica.create({
    data: { ...muestra, ...conectarReferencias(referenciaIds) },
    include: { referenciasBibliograficas: true },
  });
}
