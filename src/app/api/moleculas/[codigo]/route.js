import { NextResponse } from "next/server";
import { authorizeRequest, MOLECULE_EDITOR_ROLES } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { moleculeUpdateSchema, serializeMolecule } from "@/lib/moleculas";

const moleculeWithAttachments = {
  archivos: { select: { id: true, nombre: true, tipo: true, mimeType: true, tamano: true, createdAt: true } },
};

export async function GET(_request, context) {
  const { user, response } = await authorizeRequest();
  if (response) return response;

  const { codigo } = await context.params;
  try {
    const molecule = await prisma.molecula.findUnique({
      where: { codigo },
      include: moleculeWithAttachments,
    });
    if (!molecule) return NextResponse.json({ message: "No se encontró la molécula." }, { status: 404 });
    if (user.rol === "VISITANTE" && molecule.estado !== "PUBLICADA") {
      return NextResponse.json({ message: "No se encontró la molécula." }, { status: 404 });
    }
    return NextResponse.json(serializeMolecule(molecule));
  } catch (error) {
    console.error("No se pudo consultar la molécula:", error);
    return NextResponse.json({ message: "No se pudo consultar la molécula." }, { status: 500 });
  }
}

export async function PATCH(request, context) {
  const { user, response } = await authorizeRequest(MOLECULE_EDITOR_ROLES);
  if (response) return response;

  const { codigo } = await context.params;
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = moleculeUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los campos del formulario.", errors: parsed.error.flatten() }, { status: 400 });
  }
  if (user.rol === "INVESTIGADOR" && ["APROBADA", "PUBLICADA"].includes(parsed.data.estado)) {
    return NextResponse.json({ message: "Solo el administrador puede aprobar o publicar moléculas." }, { status: 403 });
  }

  const updateData = user.rol === "INVESTIGADOR"
    ? { ...parsed.data, estado: "EN_REVISION" }
    : parsed.data;
  try {
    const molecule = await prisma.molecula.update({
      where: { codigo },
      data: updateData,
      include: moleculeWithAttachments,
    });
    return NextResponse.json(serializeMolecule(molecule));
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "No se encontró la molécula." }, { status: 404 });
    }
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ya existe una molécula con ese código." }, { status: 409 });
    }
    console.error("No se pudo actualizar la molécula:", error);
    return NextResponse.json({ message: "No se pudo actualizar la molécula." }, { status: 500 });
  }
}
