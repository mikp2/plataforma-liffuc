import { NextResponse } from "next/server";
import { authorizeRequest, MOLECULE_EDITOR_ROLES } from "@/lib/authorization";
import { moleculeInputSchema, serializeMolecule } from "@/lib/moleculas";
import { crearMolecula, listarMoleculas } from "@/services/moleculas.service";

export async function GET(request) {
  const { user, response } = await authorizeRequest();
  if (response) return response;

  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.trim();
  const estado = searchParams.get("estado");
  const especie = searchParams.get("especie")?.trim();
  if (estado && !["BORRADOR", "EN_REVISION", "APROBADA", "PUBLICADA"].includes(estado)) {
    return NextResponse.json({ message: "El estado del filtro no es válido." }, { status: 400 });
  }
  const where = {
    ...(user.rol === "VISITANTE" ? { estado: "PUBLICADA" } : estado ? { estado } : {}),
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
    const molecules = await listarMoleculas(where);
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
  const { user, response } = await authorizeRequest(MOLECULE_EDITOR_ROLES);
  if (response) return response;

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
    const molecule = await crearMolecula({
      ...parsed.data,
      ...(user.rol === "INVESTIGADOR" ? { estado: "EN_REVISION" } : {}),
    });
    return NextResponse.json(serializeMolecule(molecule), { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ya existe una molécula con ese código o identificador químico." }, { status: 409 });
    }
    if (error?.code === "P2003" || error?.code === "P2004") {
      return NextResponse.json({ message: "Una o más referencias bibliográficas no existen." }, { status: 400 });
    }
    console.error("No se pudo crear la molécula:", error);
    return NextResponse.json({ message: "No se pudo guardar la molécula." }, { status: 500 });
  }
}
