import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";
import { ErrorValidacionCientifica } from "./errores-cientificos.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarFracciones(paginacion) {
  return consultarPagina(
    (args) => prisma.fraccion.findMany(args),
    paginacion,
    {
      include: {
        extracto: { select: { id: true, codigo: true } },
        fraccionPadre: { select: { id: true, codigo: true } },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearFraccion(data) {
  if (data.fraccionPadreId) {
    const fraccionPadre = await prisma.fraccion.findUnique({
      where: { id: data.fraccionPadreId },
      select: { extractoId: true },
    });
    if (fraccionPadre && fraccionPadre.extractoId !== data.extractoId) {
      throw new ErrorValidacionCientifica("La fracción padre debe pertenecer al mismo extracto.");
    }
  }

  const { referenciaIds, ...fraccion } = data;
  return prisma.fraccion.create({
    data: { ...fraccion, ...conectarReferencias(referenciaIds) },
    include: {
      extracto: { select: { id: true, codigo: true } },
      fraccionPadre: { select: { id: true, codigo: true } },
      referenciasBibliograficas: true,
    },
  });
}