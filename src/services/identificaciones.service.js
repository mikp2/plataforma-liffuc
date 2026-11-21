import { prisma } from "@/lib/prisma";
import { consultarPagina } from "./paginacion.service";

function conectarReferencias(referenciaIds) {
  return referenciaIds?.length
    ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
    : {};
}

export async function listarIdentificaciones(paginacion) {
  return consultarPagina(
    (args) => prisma.identificacionBotanica.findMany(args),
    paginacion,
    {
      include: {
        muestra: {
          select: { id: true, numeroVoucher: true, herbario: true, colector: true },
        },
        especie: { select: { id: true, nombreCientifico: true, familia: true } },
        referenciasBibliograficas: true,
      },
    },
  );
}

export async function crearIdentificacion(data) {
  const { referenciaIds, esVigente, ...identificacion } = data;
  return prisma.$transaction(async (transaction) => {
    if (esVigente) {
      await transaction.identificacionBotanica.updateMany({
        where: { muestraId: identificacion.muestraId, esVigente: true },
        data: { esVigente: false },
      });
    }

    return transaction.identificacionBotanica.create({
      data: {
        ...identificacion,
        esVigente,
        ...conectarReferencias(referenciaIds),
      },
      include: {
        muestra: { select: { id: true, numeroVoucher: true, herbario: true, colector: true } },
        especie: true,
        referenciasBibliograficas: true,
      },
    });
  });
}
