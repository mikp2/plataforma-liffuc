import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarBioensayos(paginacion) {
  return consultarPagina(
    (args) => prisma.bioensayo.findMany(args),
    paginacion,
    {
      include: {
        _count: { select: { resultados: true } },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearBioensayo(data) {
  const { resultados = [], referenciaIds, ...bioensayo } = data;
  return prisma.bioensayo.create({
    data: {
      ...bioensayo,
      ...conectarReferencias(referenciaIds),
      ...(resultados.length
        ? {
            resultados: {
              create: resultados.map(({ referenciaIds: ids, ...resultado }) => ({
                ...resultado,
                ...conectarReferencias(ids),
              })),
            },
          }
        : {}),
    },
    include: {
      resultados: true,
      referenciasBibliograficas: true,
    },
  });
}