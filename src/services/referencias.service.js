import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

export async function listarReferencias(paginacion) {
  return consultarPagina(
    (args) => prisma.referenciaBibliografica.findMany(args),
    paginacion,
  );
}

export async function crearReferencia(data) {
  return prisma.referenciaBibliografica.create({
    data: { ...data, ...(data.doi ? { doi: data.doi.toLowerCase() } : {}) },
  });
}
