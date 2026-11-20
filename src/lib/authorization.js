import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getActiveSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.usuario.findUnique({
    where: { id: session.user.id },
    select: { id: true, nombre: true, email: true, username: true, rol: true, activo: true },
  });
  if (!user?.activo) return null;

  return {
    ...session,
    user: {
      ...session.user,
      id: user.id,
      name: user.nombre,
      email: user.email,
      username: user.username,
      role: user.rol,
    },
  };
}

export async function authorizeRequest(allowedRoles = null) {
  try {
    const session = await getActiveSession();
    if (!session) {
      return {
        user: null,
        response: NextResponse.json({ message: "Debes iniciar sesión." }, { status: 401 }),
      };
    }
    const user = { ...session.user, rol: session.user.role };

    if (allowedRoles && !allowedRoles.includes(user.rol)) {
      return {
        user: null,
        response: NextResponse.json({ message: "No tienes permisos para realizar esta acción." }, { status: 403 }),
      };
    }

    return { user, response: null };
  } catch (error) {
    console.error("No se pudo verificar la autorización del usuario:", error);
    return {
      user: null,
      response: NextResponse.json({ message: "No se pudo verificar la sesión." }, { status: 500 }),
    };
  }
}

export const MOLECULE_EDITOR_ROLES = ["ADMIN", "INVESTIGADOR"];
