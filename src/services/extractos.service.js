import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarExtractos(paginacion) {
  return consultarPagina(
    (args) => prisma.extracto.findMany(args),
    paginacion,
    {
      include: {
        identificacion: {
          include: {
            especie: { select: { id: true, nombreCientifico: true } },
            muestra: { select: { id: true, numeroVoucher: true, herbario: true } },
          },
        },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearExtracto(data) {
  const { referenciaIds, ...extracto } = data;
  return prisma.extracto.create({
    data: { ...extracto, ...conectarReferencias(referenciaIds) },
    include: {
      identificacion: {
        include: {
          especie: { select: { id: true, nombreCientifico: true } },
          muestra: { select: { id: true, numeroVoucher: true, herbario: true } },
        },
      },
      referenciasBibliograficas: true,
    },
  });
}