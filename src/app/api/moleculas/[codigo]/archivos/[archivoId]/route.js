import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { authorizeRequest, MOLECULE_EDITOR_ROLES } from "@/lib/authorization";
import { getMoleculeFilePath, removeStoredMoleculeFile } from "@/lib/molecule-files";
import { prisma } from "@/lib/prisma";

export async function GET(_request, context) {
  const { user, response } = await authorizeRequest();
  if (response) return response;

  const { codigo, archivoId } = await context.params;
  try {
    const attachment = await prisma.archivoMolecula.findFirst({
      where: { id: archivoId, molecula: { codigo } },
      include: { molecula: { select: { estado: true } } },
    });
    if (!attachment) return NextResponse.json({ message: "No se encontró el archivo." }, { status: 404 });
    if (user.rol === "VISITANTE" && attachment.molecula.estado !== "PUBLICADA") {
      return NextResponse.json({ message: "No se encontró el archivo." }, { status: 404 });
    }

    const contents = await readFile(getMoleculeFilePath(attachment.nombreAlmacenado));
    const filename = encodeURIComponent(attachment.nombre).replace(/['()*]/g, (char) =>
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    return new Response(contents, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(contents.length),
        "Content-Disposition": `inline; filename*=UTF-8''${filename}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
        "Content-Security-Policy": "sandbox",
      },
    });
  } catch (error) {
    console.error("No se pudo leer el archivo de la molécula:", error);
    return NextResponse.json({ message: "No se pudo abrir el archivo." }, { status: 500 });
  }
}

export async function DELETE(_request, context) {
  const { user, response } = await authorizeRequest(MOLECULE_EDITOR_ROLES);
  if (response) return response;

  const { codigo, archivoId } = await context.params;
  try {
    const attachment = await prisma.archivoMolecula.findFirst({
      where: { id: archivoId, molecula: { codigo } },
      include: { molecula: { select: { id: true } } },
    });
    if (!attachment) return NextResponse.json({ message: "No se encontró el archivo." }, { status: 404 });

    if (user.rol === "INVESTIGADOR") {
      await prisma.molecula.update({ where: { id: attachment.molecula.id }, data: { estado: "EN_REVISION" } });
    }
    await prisma.archivoMolecula.delete({ where: { id: archivoId } });
    try {
      await removeStoredMoleculeFile(attachment.nombreAlmacenado);
    } catch (error) {
      console.error(`No se pudo eliminar el archivo almacenado ${attachment.nombreAlmacenado}:`, error);
      return NextResponse.json({ message: "El registro fue eliminado, pero no se pudo borrar el archivo físico." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("No se pudo eliminar el archivo de la molécula:", error);
    return NextResponse.json({ message: "No se pudo eliminar el archivo." }, { status: 500 });
  }
}
