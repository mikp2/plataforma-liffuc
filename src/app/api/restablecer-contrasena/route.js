import { createHash } from "node:crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
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

  const parsed = resetSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({
      message: "Revisa los datos. La contraseña debe tener entre 8 y 72 bytes y coincidir con su confirmación.",
    }, { status: 400 });
  }

  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
  const passwordHash = await hash(parsed.data.password, 12);
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const reset = await transaction.recuperacionContrasena.findUnique({ where: { tokenHash } });
      if (!reset) return "invalid";
      if (reset.expiresAt <= now) {
        await transaction.recuperacionContrasena.delete({ where: { id: reset.id } });
        return "expired";
      }

      const claimed = await transaction.recuperacionContrasena.deleteMany({
        where: { id: reset.id, tokenHash, expiresAt: { gt: now } },
      });
      if (claimed.count !== 1) return "invalid";

      await transaction.usuario.update({
        where: { id: reset.usuarioId },
        data: { passwordHash },
      });
      return "updated";
    });

    if (result === "expired") {
      return NextResponse.json({ message: "El enlace venció. Solicita uno nuevo." }, { status: 410 });
    }
    if (result !== "updated") {
      return NextResponse.json({ message: "El enlace no es válido o ya fue utilizado. Solicita uno nuevo." }, { status: 400 });
    }

    return NextResponse.json({ message: "Tu contraseña se actualizó. Ya puedes iniciar sesión." });
  } catch (error) {
    console.error("No se pudo restablecer la contraseña:", error);
    return NextResponse.json({ message: "No se pudo restablecer la contraseña." }, { status: 500 });
  }
}
