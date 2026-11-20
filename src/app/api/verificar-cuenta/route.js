import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "La solicitud de confirmación no es válida." }, { status: 400 });
  }

  const parsed = z.object({ token: tokenSchema }).safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ message: "El enlace de confirmación no es válido." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const now = new Date();
  try {
    const registration = await prisma.$transaction(async (transaction) => {
      const pending = await transaction.registroPendiente.findUnique({ where: { tokenHash } });
      if (!pending) return { status: "invalid" };
      if (pending.expiresAt <= now) {
        await transaction.registroPendiente.delete({ where: { id: pending.id } });
        return { status: "expired" };
      }

      const claimed = await transaction.registroPendiente.deleteMany({
        where: { id: pending.id, tokenHash, expiresAt: { gt: now } },
      });
      if (claimed.count !== 1) return { status: "invalid" };

      const user = await transaction.usuario.create({
        data: {
          nombre: pending.nombre,
          email: pending.email,
          username: pending.username,
          passwordHash: pending.passwordHash,
          rol: "VISITANTE",
          activo: true,
        },
        select: { id: true },
      });
      return { status: "verified", userId: user.id };
    });

    if (registration.status === "expired") {
      return NextResponse.json({ message: "El enlace venció. Vuelve a solicitar el registro." }, { status: 410 });
    }
    if (registration.status !== "verified") {
      return NextResponse.json({ message: "El enlace no es válido o ya fue utilizado." }, { status: 400 });
    }

    return NextResponse.json({ message: "Correo confirmado. Ya puedes iniciar sesión como visitante." });
  } catch (error) {
    if (error?.code === "P2002") {
      await prisma.registroPendiente.deleteMany({ where: { tokenHash } });
      return NextResponse.json({ message: "El correo o nombre de usuario ya está registrado." }, { status: 409 });
    }
    console.error("No se pudo confirmar el correo de la cuenta:", error);
    return NextResponse.json({ message: "No se pudo confirmar la cuenta." }, { status: 500 });
  }
}
