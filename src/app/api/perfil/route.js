import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
}).strict();

export async function PATCH(request) {
  const { user, response } = await authorizeRequest();
  if (response) return response;

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({
      message: "Ingresa un nombre y un nombre de usuario válido (3 a 50 caracteres: letras, números, punto, guion o guion bajo).",
      errors: parsed.error.flatten(),
    }, { status: 400 });
  }

  const username = parsed.data.username.toLowerCase();
  try {
    const existing = await prisma.usuario.findUnique({ where: { username }, select: { id: true } });
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ message: "Ese nombre de usuario ya existe. Escoge otro." }, { status: 409 });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: user.id },
      data: { nombre: parsed.data.nombre, username },
      select: { id: true, nombre: true, email: true, username: true, rol: true },
    });
    return NextResponse.json({ usuario: updatedUser });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ese nombre de usuario ya existe. Escoge otro." }, { status: 409 });
    }
    console.error("No se pudo actualizar el perfil:", error);
    return NextResponse.json({ message: "No se pudo actualizar el perfil." }, { status: 500 });
  }
}
