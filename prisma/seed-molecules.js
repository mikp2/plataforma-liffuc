const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const molecules = [
  {
    codigo: "LFC-DEMO-001",
    nombre: "Fitoejemplo A",
    formula: "C15H24O",
    pesoMolecular: 220.36,
    especie: "Planta ficticia alfa",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro completamente ficticio, creado para probar el catálogo y su edición.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "BORRADOR",
  },
  {
    codigo: "LFC-DEMO-002",
    nombre: "Fitoejemplo B",
    formula: "C18H30O2",
    pesoMolecular: 278.43,
    especie: "Planta ficticia beta",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Molécula inventada para verificar filtros por especie y estado.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "EN_REVISION",
  },
  {
    codigo: "LFC-DEMO-003",
    nombre: "Fitoejemplo C",
    formula: "C10H16O",
    pesoMolecular: 152.24,
    especie: "Planta ficticia gamma",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Compuesto de prueba para visualizar información general.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "APROBADA",
  },
  {
    codigo: "LFC-DEMO-004",
    nombre: "Fitoejemplo D",
    formula: "C20H32O",
    pesoMolecular: 288.47,
    especie: "Planta ficticia alfa",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro ficticio para probar búsqueda por fórmula química.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "PUBLICADA",
  },
  {
    codigo: "LFC-DEMO-005",
    nombre: "Fitoejemplo E",
    formula: "C12H20O2",
    pesoMolecular: 196.29,
    especie: "Planta ficticia delta",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro demostrativo con un estado de revisión.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "EN_REVISION",
  },
  {
    codigo: "LFC-DEMO-006",
    nombre: "Fitoejemplo F",
    formula: "C16H26O3",
    pesoMolecular: 266.38,
    especie: "Planta ficticia epsilon",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Molécula inventada para revisar la tabla del catálogo.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "BORRADOR",
  },
  {
    codigo: "LFC-DEMO-007",
    nombre: "Fitoejemplo G",
    formula: "C14H22O",
    pesoMolecular: 206.33,
    especie: "Planta ficticia beta",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro ficticio de ejemplo con datos editables.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "APROBADA",
  },
  {
    codigo: "LFC-DEMO-008",
    nombre: "Fitoejemplo H",
    formula: "C19H28O2",
    pesoMolecular: 288.43,
    especie: "Planta ficticia zeta",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro de muestra para probar orden y filtros combinados.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "PUBLICADA",
  },
  {
    codigo: "LFC-DEMO-009",
    nombre: "Fitoejemplo I",
    formula: "C11H18O3",
    pesoMolecular: 198.26,
    especie: "Planta ficticia eta",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro de prueba sin evidencia ni resultados reales.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "BORRADOR",
  },
  {
    codigo: "LFC-DEMO-010",
    nombre: "Fitoejemplo J",
    formula: "C17H26O2",
    pesoMolecular: 262.39,
    especie: "Planta ficticia theta",
    familia: "Familia de demostración",
    origen: "Colección de datos de prueba",
    descripcion: "Registro ficticio para completar la prueba de diez elementos.",
    actividad: "Actividad de ejemplo, sin valor experimental.",
    metodoObtencion: "Dato simulado para demostración.",
    referencias: "Registro ficticio de demostración; no corresponde a una publicación.",
    estado: "EN_REVISION",
  },
];

async function main() {
  for (const molecule of molecules) {
    await prisma.molecula.upsert({
      where: { codigo: molecule.codigo },
      update: molecule,
      create: molecule,
    });
  }

  console.log(`Se insertaron o actualizaron ${molecules.length} moléculas ficticias de demostración.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("No se pudieron cargar las moléculas de demostración:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
