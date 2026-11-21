import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

export async function listarEspecies(paginacion) {
  return consultarPagina(
    (args) => prisma.especie.findMany(args),
    paginacion,
    { include: { _count: { select: { identificaciones: true } } } },
  );
}

export async function crearEspecie(data) {
  const { referenciaIds, ...especie } = data;
  return prisma.especie.create({
    data: {
      ...especie,
      ...(referenciaIds?.length
        ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
        : {}),
    },
    include: { referenciasBibliograficas: true },
  });
}