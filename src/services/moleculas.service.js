import { prisma } from "@/lib/prisma";

const moleculeWithAttachments = {
  archivos: {
    select: { id: true, nombre: true, tipo: true, mimeType: true, tamano: true, createdAt: true },
  },
};

export async function listarMoleculas(where) {
  return prisma.molecula.findMany({
    where,
    include: moleculeWithAttachments,
    orderBy: { updatedAt: "desc" },
  });
}

export async function crearMolecula(data) {
  const { referenciaIds, ...molecula } = data;
  return prisma.molecula.create({
    data: {
      ...molecula,
      ...(referenciaIds?.length
        ? { referenciasBibliograficas: { connect: referenciaIds.map((id) => ({ id })) } }
        : {}),
    },
    include: moleculeWithAttachments,
  });
}