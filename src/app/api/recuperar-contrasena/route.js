import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});
const genericResponse = {
  message: "Si existe una cuenta activa con ese correo, recibirás instrucciones para restablecer la contraseña.",
};

export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ message: "Ingresa un correo electrónico válido." }, { status: 400 });
  }

  try {
    const now = new Date();
    await prisma.recuperacionContrasena.deleteMany({ where: { expiresAt: { lte: now } } });
    const user = await prisma.usuario.findFirst({
      where: { email: parsed.data.email.toLowerCase(), activo: true },
      select: { id: true, nombre: true, email: true },
    });
    if (!user) return NextResponse.json(genericResponse, { status: 202 });

    const existing = await prisma.recuperacionContrasena.findUnique({ where: { usuarioId: user.id } });
    if (existing && now.getTime() - existing.createdAt.getTime() < 60_000) {
      return NextResponse.json(genericResponse, { status: 202 });
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    await prisma.recuperacionContrasena.upsert({
      where: { usuarioId: user.id },
      update: { tokenHash, expiresAt, createdAt: now },
      create: { usuarioId: user.id, tokenHash, expiresAt, createdAt: now },
    });

    try {
      await sendPasswordResetEmail({ email: user.email, name: user.nombre, token });
    } catch (error) {
      await prisma.recuperacionContrasena.deleteMany({ where: { usuarioId: user.id, tokenHash } });
      console.error("No se pudo enviar el correo para restablecer la contraseña:", error);
    }

    return NextResponse.json(genericResponse, { status: 202 });
  } catch (error) {
    console.error("No se pudo procesar la solicitud para restablecer contraseña:", error);
    return NextResponse.json({ message: "No se pudo procesar la solicitud. Intenta más tarde." }, { status: 500 });
  }
}
