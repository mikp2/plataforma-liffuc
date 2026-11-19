const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminUsername = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminUsername || !adminPassword) {
    throw new Error(
      "Configura ADMIN_EMAIL, ADMIN_USERNAME y ADMIN_PASSWORD para crear el administrador inicial."
    );
  }

  if (adminPassword.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.usuario.upsert({
    where: { email: adminEmail },
    update: {
      nombre: process.env.ADMIN_NAME?.trim() || "Administrador LIFFUC",
      username: adminUsername,
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
    create: {
      nombre: process.env.ADMIN_NAME?.trim() || "Administrador LIFFUC",
      email: adminEmail,
      username: adminUsername,
      passwordHash,
      rol: "ADMIN",
    },
  });

  await prisma.estadoSistema.upsert({
    where: { clave: "app" },
    update: { valor: "banco-moleculas" },
    create: { clave: "app", valor: "banco-moleculas" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
