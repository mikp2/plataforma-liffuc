import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { serializeMolecule } from "@/lib/moleculas";

const moleculeWithAttachments = {
  archivos: { select: { id: true, nombre: true, tipo: true, mimeType: true, tamano: true, createdAt: true } },
};

export async function PATCH(_request, context) {
  const { response } = await authorizeRequest(["ADMIN"]);
  if (response) return response;

  const { codigo } = await context.params;
  try {
    const molecule = await prisma.molecula.findUnique({ where: { codigo }, select: { id: true, estado: true } });
    if (!molecule) return NextResponse.json({ message: "No se encontró la molécula." }, { status: 404 });
    if (molecule.estado !== "EN_REVISION") {
      return NextResponse.json({ message: "Solo se pueden aprobar moléculas en revisión." }, { status: 409 });
    }

    const approved = await prisma.molecula.update({
      where: { codigo },
      data: { estado: "APROBADA" },
      include: moleculeWithAttachments,
    });
    return NextResponse.json(serializeMolecule(approved));
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "No se encontró la molécula." }, { status: 404 });
    }
    console.error("No se pudo aprobar la molécula:", error);
    return NextResponse.json({ message: "No se pudo aprobar la molécula." }, { status: 500 });
  }
}
