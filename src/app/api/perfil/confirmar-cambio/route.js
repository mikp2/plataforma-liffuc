import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const confirmationSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
});

export async function POST(request) {
  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ message: "La solicitud de confirmación no es válida." }, { status: 400 });
  }

  const parsed = confirmationSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ message: "El enlace de confirmación no es válido." }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const now = new Date();
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const pending = await transaction.cambioCuentaPendiente.findUnique({ where: { tokenHash } });
      if (!pending) return { status: "invalid" };
      if (pending.expiresAt <= now) {
        await transaction.cambioCuentaPendiente.delete({ where: { id: pending.id } });
        return { status: "expired" };
      }

      const account = await transaction.usuario.findUnique({
        where: { id: pending.usuarioId },
        select: { email: true },
      });
      if (!account || account.email !== pending.emailVerificacion) {
        await transaction.cambioCuentaPendiente.delete({ where: { id: pending.id } });
        return { status: "invalid" };
      }

      const claimed = await transaction.cambioCuentaPendiente.deleteMany({
        where: { id: pending.id, tokenHash, expiresAt: { gt: now } },
      });
      if (claimed.count !== 1) return { status: "invalid" };

      if (pending.tipo === "EMAIL" && pending.emailNuevo) {
        await transaction.usuario.update({
          where: { id: pending.usuarioId },
          data: { email: pending.emailNuevo },
        });
        return { status: "confirmed", message: "El correo de tu cuenta fue actualizado." };
      }
      if (pending.tipo === "PASSWORD" && pending.passwordHashNuevo) {
        await transaction.usuario.update({
          where: { id: pending.usuarioId },
          data: { passwordHash: pending.passwordHashNuevo },
        });
        return { status: "confirmed", message: "La contraseña de tu cuenta fue actualizada." };
      }

      return { status: "invalid" };
    });

    if (result.status === "expired") {
      return NextResponse.json({ message: "El enlace venció. Solicita el cambio nuevamente." }, { status: 410 });
    }
    if (result.status !== "confirmed") {
      return NextResponse.json({ message: "El enlace no es válido o ya fue utilizado." }, { status: 400 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    if (error?.code === "P2002") {
      return NextResponse.json({ message: "Ese correo ya está asociado a otra cuenta. Solicita un cambio con otro correo." }, { status: 409 });
    }
    console.error("No se pudo confirmar el cambio de cuenta:", error);
    return NextResponse.json({ message: "No se pudo confirmar el cambio de cuenta." }, { status: 500 });
  }
}
