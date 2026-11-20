import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request, context) {
  const { user, response } = await authorizeRequest(["ADMIN"]);
  if (response) return response;

  const { id } = await context.params;
  if (id === user.id) {
    return NextResponse.json({ message: "No puedes eliminar la cuenta con la que iniciaste sesión." }, { status: 409 });
  }

  try {
    const target = await prisma.usuario.findUnique({ where: { id }, select: { rol: true } });
    if (!target) return NextResponse.json({ message: "No se encontró el usuario." }, { status: 404 });
    if (target.rol === "ADMIN") {
      return NextResponse.json({ message: "La cuenta administradora no se puede eliminar." }, { status: 409 });
    }

    await prisma.usuario.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error?.code === "P2025") {
      return NextResponse.json({ message: "No se encontró el usuario." }, { status: 404 });
    }
    console.error("No se pudo eliminar el usuario:", error);
    return NextResponse.json({ message: "No se pudo eliminar el usuario." }, { status: 500 });
  }
}
