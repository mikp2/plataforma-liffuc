import { createHash, randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVisitorVerificationEmail } from "@/lib/email";

const registrationSchema = z.object({
  nombre: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8).max(72).refine((value) => Buffer.byteLength(value, "utf8") <= 72),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Las contraseñas no coinciden.",
});

export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({
      message: "Revisa los datos. La contraseña debe tener entre 8 y 72 bytes.",
      errors: parsed.error.flatten(),
    }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const username = parsed.data.username.toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  try {
    await prisma.registroPendiente.deleteMany({ where: { expiresAt: { lte: now } } });

    const existingUsername = await prisma.usuario.findUnique({ where: { username }, select: { id: true } });
    if (existingUsername) {
      return NextResponse.json({ message: "Ese nombre de usuario ya existe. Escoge otro." }, { status: 409 });
    }
    const existingEmail = await prisma.usuario.findUnique({ where: { email }, select: { id: true } });
    if (existingEmail) {
      return NextResponse.json({ message: "Ese correo ya está asociado a una cuenta." }, { status: 409 });
    }

    const pendingByUsername = await prisma.registroPendiente.findUnique({ where: { username } });
    if (pendingByUsername && pendingByUsername.email !== email) {
      return NextResponse.json({ message: "Ese nombre de usuario ya está solicitado. Escoge otro." }, { status: 409 });
    }

    const existingRegistration = await prisma.registroPendiente.findUnique({ where: { email } });
    if (existingRegistration && existingRegistration.username !== username) {
      return NextResponse.json({ message: "Ese correo ya tiene un registro pendiente. Usa el nombre de usuario de esa solicitud o espera a que venza." }, { status: 409 });
    }
    if (existingRegistration && now.getTime() - existingRegistration.createdAt.getTime() < 60_000) {
      return NextResponse.json({ message: "Espera un minuto antes de solicitar otro correo de confirmación." }, { status: 429 });
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const registration = await prisma.registroPendiente.upsert({
      where: { email },
      update: {
        nombre: parsed.data.nombre,
        username,
        passwordHash,
        tokenHash,
        expiresAt,
        createdAt: now,
      },
      create: {
        nombre: parsed.data.nombre,
        email,
        username,
        passwordHash,
        tokenHash,
        expiresAt,
      },
      select: { id: true },
    });

    try {
      await sendVisitorVerificationEmail({ email, name: parsed.data.nombre, token });
    } catch (error) {
      await prisma.registroPendiente.deleteMany({ where: { id: registration.id, tokenHash } });
      console.error("No se pudo enviar el correo de confirmación de cuenta:", error);
      return NextResponse.json({
        message: "No se pudo enviar el correo de confirmación. Intenta más tarde o contacta al administrador.",
      }, { status: 503 });
    }

    return NextResponse.json({
      message: "Te enviamos un correo para confirmar la cuenta. El enlace vence en 24 horas.",
    }, { status: 202 });
  } catch (error) {
    if (error?.code === "P2002") {
      const existingUsername = await prisma.usuario.findUnique({ where: { username }, select: { id: true } });
      if (existingUsername) {
        return NextResponse.json({ message: "Ese nombre de usuario ya existe. Escoge otro." }, { status: 409 });
      }
      const pendingUsername = await prisma.registroPendiente.findUnique({ where: { username }, select: { email: true } });
      if (pendingUsername && pendingUsername.email !== email) {
        return NextResponse.json({ message: "Ese nombre de usuario ya está solicitado. Escoge otro." }, { status: 409 });
      }
      return NextResponse.json({ message: "Ese correo ya está asociado a una cuenta o tiene un registro pendiente." }, { status: 409 });
    }
    console.error("No se pudo procesar el registro de visitante:", error);
    return NextResponse.json({ message: "No se pudo procesar el registro." }, { status: 500 });
  }
}
