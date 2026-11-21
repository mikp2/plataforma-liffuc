-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'INVESTIGADOR', 'VISITANTE');

-- CreateEnum
CREATE TYPE "EstadoMolecula" AS ENUM ('BORRADOR', 'EN_REVISION', 'APROBADA', 'PUBLICADA');

-- CreateEnum
CREATE TYPE "TipoArchivoMolecula" AS ENUM ('IMAGEN', 'PDF');

-- CreateEnum
CREATE TYPE "TipoCambioCuenta" AS ENUM ('EMAIL', 'PASSWORD');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'INVESTIGADOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_pendientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_pendientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recuperaciones_contrasena" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recuperaciones_contrasena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cambios_cuenta_pendientes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoCambioCuenta" NOT NULL,
    "emailVerificacion" TEXT NOT NULL,
    "emailNuevo" TEXT,
    "passwordHashNuevo" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambios_cuenta_pendientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estado_sistema" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estado_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moleculas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "formula" TEXT,
    "pesoMolecular" DOUBLE PRECISION,
    "especie" TEXT NOT NULL,
    "familia" TEXT,
    "origen" TEXT,
    "descripcion" TEXT NOT NULL,
    "actividad" TEXT,
    "metodoObtencion" TEXT,
    "referencias" TEXT,
    "estado" "EstadoMolecula" NOT NULL DEFAULT 'BORRADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moleculas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "archivos_molecula" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nombreAlmacenado" TEXT NOT NULL,
    "tipo" "TipoArchivoMolecula" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "moleculaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivos_molecula_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "registros_pendientes_email_key" ON "registros_pendientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "registros_pendientes_username_key" ON "registros_pendientes"("username");

-- CreateIndex
CREATE UNIQUE INDEX "registros_pendientes_tokenHash_key" ON "registros_pendientes"("tokenHash");

-- CreateIndex
CREATE INDEX "registros_pendientes_expiresAt_idx" ON "registros_pendientes"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "recuperaciones_contrasena_usuarioId_key" ON "recuperaciones_contrasena"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "recuperaciones_contrasena_tokenHash_key" ON "recuperaciones_contrasena"("tokenHash");

-- CreateIndex
CREATE INDEX "recuperaciones_contrasena_expiresAt_idx" ON "recuperaciones_contrasena"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "cambios_cuenta_pendientes_usuarioId_key" ON "cambios_cuenta_pendientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "cambios_cuenta_pendientes_emailNuevo_key" ON "cambios_cuenta_pendientes"("emailNuevo");

-- CreateIndex
CREATE UNIQUE INDEX "cambios_cuenta_pendientes_tokenHash_key" ON "cambios_cuenta_pendientes"("tokenHash");

-- CreateIndex
CREATE INDEX "cambios_cuenta_pendientes_expiresAt_idx" ON "cambios_cuenta_pendientes"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "estado_sistema_clave_key" ON "estado_sistema"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "moleculas_codigo_key" ON "moleculas"("codigo");

-- CreateIndex
CREATE INDEX "moleculas_nombre_idx" ON "moleculas"("nombre");

-- CreateIndex
CREATE INDEX "moleculas_especie_idx" ON "moleculas"("especie");

-- CreateIndex
CREATE INDEX "moleculas_estado_idx" ON "moleculas"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "archivos_molecula_nombreAlmacenado_key" ON "archivos_molecula"("nombreAlmacenado");

-- CreateIndex
CREATE INDEX "archivos_molecula_moleculaId_idx" ON "archivos_molecula"("moleculaId");

-- AddForeignKey
ALTER TABLE "recuperaciones_contrasena" ADD CONSTRAINT "recuperaciones_contrasena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cambios_cuenta_pendientes" ADD CONSTRAINT "cambios_cuenta_pendientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivos_molecula" ADD CONSTRAINT "archivos_molecula_moleculaId_fkey" FOREIGN KEY ("moleculaId") REFERENCES "moleculas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
