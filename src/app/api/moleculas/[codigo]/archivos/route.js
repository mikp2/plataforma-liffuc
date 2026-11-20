import { NextResponse } from "next/server";
import { authorizeRequest, MOLECULE_EDITOR_ROLES } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import {
  MAX_FILE_COUNT,
  MAX_TOTAL_UPLOAD_SIZE,
  UploadValidationError,
  persistMoleculeFiles,
  removeStoredMoleculeFile,
} from "@/lib/molecule-files";

export async function POST(request, context) {
  const { user, response } = await authorizeRequest(MOLECULE_EDITOR_ROLES);
  if (response) return response;

  const { codigo } = await context.params;
  let molecule;
  try {
    molecule = await prisma.molecula.findUnique({ where: { codigo }, select: { id: true } });
  } catch (error) {
    console.error("No se pudo consultar la molécula para adjuntar archivos:", error);
    return NextResponse.json({ message: "No se pudo consultar la molécula." }, { status: 500 });
  }
  if (!molecule) return NextResponse.json({ message: "No se encontró la molécula." }, { status: 404 });

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "El formulario de archivos no es válido." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((file) => typeof File !== "undefined" && file instanceof File && file.size > 0);
  if (files.length === 0) {
    return NextResponse.json({ message: "Selecciona al menos una imagen o un PDF." }, { status: 400 });
  }
  if (files.length > MAX_FILE_COUNT) {
    return NextResponse.json({ message: `Puedes subir hasta ${MAX_FILE_COUNT} archivos a la vez.` }, { status: 400 });
  }
  if (files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_UPLOAD_SIZE) {
    return NextResponse.json({ message: "El tamaño total de los archivos supera los 40 MB." }, { status: 413 });
  }

  let savedFiles = [];
  try {
    savedFiles = await persistMoleculeFiles(files, molecule.id);
    await prisma.archivoMolecula.createMany({ data: savedFiles });
    if (user.rol === "INVESTIGADOR") {
      await prisma.molecula.update({ where: { id: molecule.id }, data: { estado: "EN_REVISION" } });
    }
    const attachments = await prisma.archivoMolecula.findMany({
      where: { moleculaId: molecule.id },
      select: { id: true, nombre: true, tipo: true, mimeType: true, tamano: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ archivos: attachments }, { status: 201 });
  } catch (error) {
    await Promise.all(
      savedFiles.map(async (file) => {
        try {
          await prisma.archivoMolecula.deleteMany({ where: { nombreAlmacenado: file.nombreAlmacenado } });
          await removeStoredMoleculeFile(file.nombreAlmacenado);
        } catch (cleanupError) {
          console.error(`No se pudo limpiar el archivo ${file.nombreAlmacenado}:`, cleanupError);
        }
      }),
    );
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error("No se pudieron guardar los archivos de la molécula:", error);
    return NextResponse.json({ message: "No se pudieron guardar los archivos." }, { status: 500 });
  }
}
