import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeRequest } from "@/lib/authorization";
import { sendAccountChangeConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const passwordSchema = z.string().min(8).max(72)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72);

const changeRequestSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("EMAIL"),
    emailNuevo: z.string().trim().email().max(254),
  }).strict(),
  z.object({
    tipo: z.literal("PASSWORD"),
    contrasenaActual: z.string().min(1),
    contrasenaNueva: passwordSchema,
  }).strict(),
]);

export async function POST(request) {
  const { user, response } = await authorizeRequest();
  if (response) return response;

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "El cuerpo de la solicitud debe ser JSON válido." }, { status: 400 });
  }

  const parsed = changeRequestSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({
      message: "Los datos del cambio no son válidos. La nueva contraseña debe tener entre 8 y 72 bytes.",
      errors: parsed.error.flatten(),
    }, { status: 400 });
  }

  try {
    const account = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { id: true, nombre: true, email: true, passwordHash: true },
    });
    if (!account) return NextResponse.json({ message: "No se encontró la cuenta." }, { status: 404 });

    let emailNuevo = null;
    let passwordHashNuevo = null;
    let newValue = "";
    if (parsed.data.tipo === "EMAIL") {
      emailNuevo = parsed.data.emailNuevo.toLowerCase();
      if (emailNuevo === account.email.toLowerCase()) {
        return NextResponse.json({ message: "El correo nuevo debe ser diferente al correo actual." }, { status: 400 });
      }

      const emailInUse = await prisma.usuario.findUnique({ where: { email: emailNuevo }, select: { id: true } });
      if (emailInUse) {
        return NextResponse.json({ message: "Ese correo ya está asociado a una cuenta." }, { status: 409 });
      }
      newValue = emailNuevo;
    } else {
      const passwordMatches = await compare(parsed.data.contrasenaActual, account.passwordHash);
      if (!passwordMatches) {
        return NextResponse.json({ message: "La contraseña actual no es correcta." }, { status: 403 });
      }
      passwordHashNuevo = await hash(parsed.data.contrasenaNueva, 12);
      newValue = "la nueva contraseña";
    }

    const now = new Date();
    const existing = await prisma.cambioCuentaPendiente.findUnique({ where: { usuarioId: user.id } });
    if (existing && now.getTime() - existing.createdAt.getTime() < 60_000) {
      return NextResponse.json({ message: "Espera un minuto antes de solicitar otro cambio de cuenta." }, { status: 429 });
    }

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    const pending = await prisma.cambioCuentaPendiente.upsert({
      where: { usuarioId: user.id },
      update: {
        tipo: parsed.data.tipo,
        emailVerificacion: account.email,
        emailNuevo,
        passwordHashNuevo,
        tokenHash,
        expiresAt,
        createdAt: now,
      },
      create: {
        usuarioId: user.id,
        tipo: parsed.data.tipo,
        emailVerificacion: account.email,
        emailNuevo,
        passwordHashNuevo,
        tokenHash,
        expiresAt,
      },
      select: { id: true },
    });

    try {
      await sendAccountChangeConfirmation({
        email: account.email,
        name: account.nombre,
        token,
        changeType: parsed.data.tipo,
        newValue,
      });
    } catch (error) {
      await prisma.cambioCuentaPendiente.deleteMany({ where: { id: pending.id, tokenHash } });
      console.error("No se pudo enviar la confirmación del cambio de cuenta:", error);
      return NextResponse.json({
        message: "No se pudo enviar el correo de confirmación. Intenta más tarde.",
      }, { status: 503 });
    }

    return NextResponse.json({
      message: `Enviamos un enlace de confirmación al correo actualmente registrado (${account.email}). El enlace vence en una hora.`,
    }, { status: 202 });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ese correo ya está solicitado para otra cuenta." }, { status: 409 });
    }
    console.error("No se pudo solicitar el cambio de cuenta:", error);
    return NextResponse.json({ message: "No se pudo solicitar el cambio de cuenta." }, { status: 500 });
  }
}
