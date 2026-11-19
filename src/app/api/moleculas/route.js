import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moleculeInputSchema, serializeMolecule } from "@/lib/moleculas";

const moleculeWithAttachments = {
  archivos: { select: { id: true, nombre: true, tipo: true, mimeType: true, tamano: true, createdAt: true } },
};

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 });

  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.trim();
  const estado = searchParams.get("estado");
  const especie = searchParams.get("especie")?.trim();
  if (estado && !["BORRADOR", "EN_REVISION", "APROBADA", "PUBLICADA"].includes(estado)) {
    return NextResponse.json({ message: "El estado del filtro no es válido." }, { status: 400 });
  }
  const where = {
    ...(estado ? { estado } : {}),
    ...(especie ? { especie: { contains: especie, mode: "insensitive" } } : {}),
    ...(query
      ? {
          OR: [
            { codigo: { contains: query, mode: "insensitive" } },
            { nombre: { contains: query, mode: "insensitive" } },
            { formula: { contains: query, mode: "insensitive" } },
            { especie: { contains: query, mode: "insensitive" } },
            { familia: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  try {
    const molecules = await prisma.molecula.findMany({
      where,
      include: moleculeWithAttachments,
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({
      moleculas: molecules.map(serializeMolecule),
      total: molecules.length,
    });
  } catch (error) {
    console.error("No se pudo consultar el catálogo de moléculas:", error);
    return NextResponse.json({ message: "No se pudo cargar el catálogo de moléculas." }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 });

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = moleculeInputSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ message: "Revisa los campos del formulario.", errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const molecule = await prisma.molecula.create({
      data: parsed.data,
      include: moleculeWithAttachments,
    });
    return NextResponse.json(serializeMolecule(molecule), { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ya existe una molécula con ese código." }, { status: 409 });
    }
    console.error("No se pudo crear la molécula:", error);
    return NextResponse.json({ message: "No se pudo guardar la molécula." }, { status: 500 });
  }
}
