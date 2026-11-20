import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  rol: z.enum(["INVESTIGADOR", "VISITANTE"]),
});

export async function GET() {
  const { response } = await authorizeRequest(["ADMIN"]);
  if (response) return response;

  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, username: true, rol: true, activo: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("No se pudo cargar la lista de usuarios:", error);
    return NextResponse.json({ message: "No se pudo cargar la lista de usuarios." }, { status: 500 });
  }
}

export async function POST(request) {
  const { response } = await authorizeRequest(["ADMIN"]);
  if (response) return response;

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({
      message: "Revisa los datos: la contraseña debe tener entre 8 y 72 bytes y el rol debe ser Investigador o Visitante.",
      errors: parsed.error.flatten(),
    }, { status: 400 });
  }

  try {
    const existingUsername = await prisma.usuario.findUnique({
      where: { username: parsed.data.username.toLowerCase() },
      select: { id: true },
    });
    if (existingUsername) {
      return NextResponse.json({ message: "Ese nombre de usuario ya existe. Escoge otro." }, { status: 409 });
    }
    const user = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email.toLowerCase(),
        username: parsed.data.username.toLowerCase(),
        passwordHash: await hash(parsed.data.password, 12),
        rol: parsed.data.rol,
      },
      select: { id: true, nombre: true, email: true, username: true, rol: true, activo: true },
    });
    return NextResponse.json({ usuario: user }, { status: 201 });
  } catch (error) {
    if (error?.code === "P2002") {
      const existingUsername = await prisma.usuario.findUnique({
        where: { username: parsed.data.username.toLowerCase() },
        select: { id: true },
      });
      if (existingUsername) {
        return NextResponse.json({ message: "Ese nombre de usuario ya existe. Escoge otro." }, { status: 409 });
      }
      return NextResponse.json({ message: "Ese nombre de usuario o correo ya está asociado a una cuenta. Escoge otro." }, { status: 409 });
    }
    console.error("No se pudo crear el usuario:", error);
    return NextResponse.json({ message: "No se pudo crear el usuario." }, { status: 500 });
  }
}
