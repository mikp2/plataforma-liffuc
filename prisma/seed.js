const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
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
