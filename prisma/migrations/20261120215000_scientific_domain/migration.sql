-- CreateEnum
CREATE TYPE "TipoBioensayo" AS ENUM ('FARMACOLOGICO', 'TOXICOLOGICO', 'OTRO');

-- AlterTable
ALTER TABLE "moleculas" ADD COLUMN     "inchi" TEXT,
ADD COLUMN     "inchiKey" TEXT,
ADD COLUMN     "numeroCas" TEXT,
ADD COLUMN     "smilesCanonico" TEXT;

-- CreateTable
CREATE TABLE "especies" (
    "id" TEXT NOT NULL,
    "nombreCientifico" TEXT NOT NULL,
    "autorTaxonomico" TEXT,
    "genero" TEXT,
    "familia" TEXT,
    "nombreComun" TEXT,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "especies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muestras_botanicas" (
    "id" TEXT NOT NULL,
    "numeroVoucher" TEXT,
    "herbario" TEXT,
    "colector" TEXT,
    "fechaRecoleccion" DATE,
    "pais" TEXT,
    "localidad" TEXT,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "parteVegetal" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "muestras_botanicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identificaciones_botanicas" (
    "id" TEXT NOT NULL,
    "muestraId" TEXT NOT NULL,
    "especieId" TEXT NOT NULL,
    "identificadoPor" TEXT,
    "fechaIdentificacion" DATE,
    "metodo" TEXT,
    "esVigente" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identificaciones_botanicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extractos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "identificacionId" TEXT NOT NULL,
    "metodoExtraccion" TEXT NOT NULL,
    "solvente" TEXT NOT NULL,
    "parteVegetal" TEXT,
    "temperaturaC" DECIMAL(8,3),
    "duracionMinutos" INTEGER,
    "masaInicialMg" DECIMAL(14,4),
    "masaExtractoMg" DECIMAL(14,4),
    "rendimientoPct" DECIMAL(7,4),
    "condiciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extractos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fracciones" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "extractoId" TEXT NOT NULL,
    "fraccionPadreId" TEXT,
    "metodoFraccionamiento" TEXT NOT NULL,
    "faseEstacionaria" TEXT,
    "eluyente" TEXT,
    "orden" INTEGER,
    "masaMg" DECIMAL(14,4),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fracciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aislamientos" (
    "id" TEXT NOT NULL,
    "codigoMuestra" TEXT,
    "fraccionId" TEXT NOT NULL,
    "moleculaId" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "purezaPct" DECIMAL(7,4),
    "masaAisladaMg" DECIMAL(14,4),
    "fechaAislamiento" DATE,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aislamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracterizaciones_estructurales" (
    "id" TEXT NOT NULL,
    "aislamientoId" TEXT NOT NULL,
    "tecnica" TEXT NOT NULL,
    "equipo" TEXT,
    "condiciones" TEXT,
    "datos" JSONB,
    "interpretacion" TEXT,
    "fecha" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caracterizaciones_estructurales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bioensayos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoBioensayo" NOT NULL,
    "objetivo" TEXT NOT NULL,
    "modeloExperimental" TEXT,
    "organismoModelo" TEXT,
    "protocolo" TEXT,
    "endpoint" TEXT,
    "condiciones" TEXT,
    "fechaInicio" DATE,
    "fechaFin" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bioensayos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_bioensayo" (
    "id" TEXT NOT NULL,
    "bioensayoId" TEXT NOT NULL,
    "extractoId" TEXT,
    "fraccionId" TEXT,
    "moleculaId" TEXT,
    "concentracion" DECIMAL(14,6),
    "unidadConcentracion" TEXT,
    "valor" DECIMAL(18,8),
    "unidadResultado" TEXT,
    "desviacionEstandar" DECIMAL(18,8),
    "replicados" INTEGER,
    "interpretacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resultados_bioensayo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referencias_bibliograficas" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "autores" TEXT,
    "anio" INTEGER,
    "revista" TEXT,
    "volumen" TEXT,
    "numero" TEXT,
    "paginas" TEXT,
    "doi" TEXT,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referencias_bibliograficas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MoleculaToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MoleculaToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EspecieToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EspecieToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_MuestraBotanicaToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MuestraBotanicaToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_IdentificacionBotanicaToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_IdentificacionBotanicaToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ExtractoToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExtractoToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FraccionToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FraccionToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AislamientoToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AislamientoToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CaracterizacionEstructuralToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CaracterizacionEstructuralToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BioensayoToReferenciaBibliografica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BioensayoToReferenciaBibliografica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ReferenciaBibliograficaToResultadoBioensayo" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReferenciaBibliograficaToResultadoBioensayo_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "especies_nombreCientifico_key" ON "especies"("nombreCientifico");

-- CreateIndex
CREATE INDEX "especies_familia_idx" ON "especies"("familia");

-- CreateIndex
CREATE INDEX "muestras_botanicas_fechaRecoleccion_idx" ON "muestras_botanicas"("fechaRecoleccion");

-- CreateIndex
CREATE UNIQUE INDEX "muestras_botanicas_herbario_numeroVoucher_key" ON "muestras_botanicas"("herbario", "numeroVoucher");

-- CreateIndex
CREATE INDEX "identificaciones_botanicas_muestraId_idx" ON "identificaciones_botanicas"("muestraId");

-- CreateIndex
CREATE INDEX "identificaciones_botanicas_especieId_idx" ON "identificaciones_botanicas"("especieId");

-- CreateIndex
CREATE INDEX "identificaciones_botanicas_esVigente_idx" ON "identificaciones_botanicas"("esVigente");

-- CreateIndex
CREATE UNIQUE INDEX "extractos_codigo_key" ON "extractos"("codigo");

-- CreateIndex
CREATE INDEX "extractos_identificacionId_idx" ON "extractos"("identificacionId");

-- CreateIndex
CREATE UNIQUE INDEX "fracciones_codigo_key" ON "fracciones"("codigo");

-- CreateIndex
CREATE INDEX "fracciones_extractoId_idx" ON "fracciones"("extractoId");

-- CreateIndex
CREATE INDEX "fracciones_fraccionPadreId_idx" ON "fracciones"("fraccionPadreId");

-- CreateIndex
CREATE UNIQUE INDEX "fracciones_id_extractoId_key" ON "fracciones"("id", "extractoId");

-- CreateIndex
CREATE UNIQUE INDEX "aislamientos_codigoMuestra_key" ON "aislamientos"("codigoMuestra");

-- CreateIndex
CREATE INDEX "aislamientos_fraccionId_idx" ON "aislamientos"("fraccionId");

-- CreateIndex
CREATE INDEX "aislamientos_moleculaId_idx" ON "aislamientos"("moleculaId");

-- CreateIndex
CREATE INDEX "caracterizaciones_estructurales_aislamientoId_idx" ON "caracterizaciones_estructurales"("aislamientoId");

-- CreateIndex
CREATE INDEX "caracterizaciones_estructurales_tecnica_idx" ON "caracterizaciones_estructurales"("tecnica");

-- CreateIndex
CREATE UNIQUE INDEX "bioensayos_codigo_key" ON "bioensayos"("codigo");

-- CreateIndex
CREATE INDEX "bioensayos_tipo_idx" ON "bioensayos"("tipo");

-- CreateIndex
CREATE INDEX "bioensayos_fechaInicio_idx" ON "bioensayos"("fechaInicio");

-- CreateIndex
CREATE INDEX "resultados_bioensayo_bioensayoId_idx" ON "resultados_bioensayo"("bioensayoId");

-- CreateIndex
CREATE INDEX "resultados_bioensayo_extractoId_idx" ON "resultados_bioensayo"("extractoId");

-- CreateIndex
CREATE INDEX "resultados_bioensayo_fraccionId_idx" ON "resultados_bioensayo"("fraccionId");

-- CreateIndex
CREATE INDEX "resultados_bioensayo_moleculaId_idx" ON "resultados_bioensayo"("moleculaId");

-- CreateIndex
CREATE UNIQUE INDEX "referencias_bibliograficas_doi_key" ON "referencias_bibliograficas"("doi");

-- CreateIndex
CREATE INDEX "referencias_bibliograficas_titulo_idx" ON "referencias_bibliograficas"("titulo");

-- CreateIndex
CREATE INDEX "referencias_bibliograficas_anio_idx" ON "referencias_bibliograficas"("anio");

-- CreateIndex
CREATE INDEX "_MoleculaToReferenciaBibliografica_B_index" ON "_MoleculaToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_EspecieToReferenciaBibliografica_B_index" ON "_EspecieToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_MuestraBotanicaToReferenciaBibliografica_B_index" ON "_MuestraBotanicaToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_IdentificacionBotanicaToReferenciaBibliografica_B_index" ON "_IdentificacionBotanicaToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_ExtractoToReferenciaBibliografica_B_index" ON "_ExtractoToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_FraccionToReferenciaBibliografica_B_index" ON "_FraccionToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_AislamientoToReferenciaBibliografica_B_index" ON "_AislamientoToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_CaracterizacionEstructuralToReferenciaBibliografica_B_index" ON "_CaracterizacionEstructuralToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_BioensayoToReferenciaBibliografica_B_index" ON "_BioensayoToReferenciaBibliografica"("B");

-- CreateIndex
CREATE INDEX "_ReferenciaBibliograficaToResultadoBioensayo_B_index" ON "_ReferenciaBibliograficaToResultadoBioensayo"("B");

-- CreateIndex
CREATE UNIQUE INDEX "moleculas_inchiKey_key" ON "moleculas"("inchiKey");

-- CreateIndex
CREATE UNIQUE INDEX "moleculas_numeroCas_key" ON "moleculas"("numeroCas");

-- AddForeignKey
ALTER TABLE "identificaciones_botanicas" ADD CONSTRAINT "identificaciones_botanicas_muestraId_fkey" FOREIGN KEY ("muestraId") REFERENCES "muestras_botanicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identificaciones_botanicas" ADD CONSTRAINT "identificaciones_botanicas_especieId_fkey" FOREIGN KEY ("especieId") REFERENCES "especies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extractos" ADD CONSTRAINT "extractos_identificacionId_fkey" FOREIGN KEY ("identificacionId") REFERENCES "identificaciones_botanicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fracciones" ADD CONSTRAINT "fracciones_extractoId_fkey" FOREIGN KEY ("extractoId") REFERENCES "extractos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aislamientos" ADD CONSTRAINT "aislamientos_fraccionId_fkey" FOREIGN KEY ("fraccionId") REFERENCES "fracciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aislamientos" ADD CONSTRAINT "aislamientos_moleculaId_fkey" FOREIGN KEY ("moleculaId") REFERENCES "moleculas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caracterizaciones_estructurales" ADD CONSTRAINT "caracterizaciones_estructurales_aislamientoId_fkey" FOREIGN KEY ("aislamientoId") REFERENCES "aislamientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_bioensayo" ADD CONSTRAINT "resultados_bioensayo_bioensayoId_fkey" FOREIGN KEY ("bioensayoId") REFERENCES "bioensayos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_bioensayo" ADD CONSTRAINT "resultados_bioensayo_extractoId_fkey" FOREIGN KEY ("extractoId") REFERENCES "extractos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_bioensayo" ADD CONSTRAINT "resultados_bioensayo_fraccionId_fkey" FOREIGN KEY ("fraccionId") REFERENCES "fracciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_bioensayo" ADD CONSTRAINT "resultados_bioensayo_moleculaId_fkey" FOREIGN KEY ("moleculaId") REFERENCES "moleculas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MoleculaToReferenciaBibliografica" ADD CONSTRAINT "_MoleculaToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "moleculas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MoleculaToReferenciaBibliografica" ADD CONSTRAINT "_MoleculaToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspecieToReferenciaBibliografica" ADD CONSTRAINT "_EspecieToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "especies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EspecieToReferenciaBibliografica" ADD CONSTRAINT "_EspecieToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MuestraBotanicaToReferenciaBibliografica" ADD CONSTRAINT "_MuestraBotanicaToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "muestras_botanicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MuestraBotanicaToReferenciaBibliografica" ADD CONSTRAINT "_MuestraBotanicaToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdentificacionBotanicaToReferenciaBibliografica" ADD CONSTRAINT "_IdentificacionBotanicaToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "identificaciones_botanicas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IdentificacionBotanicaToReferenciaBibliografica" ADD CONSTRAINT "_IdentificacionBotanicaToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtractoToReferenciaBibliografica" ADD CONSTRAINT "_ExtractoToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "extractos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExtractoToReferenciaBibliografica" ADD CONSTRAINT "_ExtractoToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FraccionToReferenciaBibliografica" ADD CONSTRAINT "_FraccionToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "fracciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FraccionToReferenciaBibliografica" ADD CONSTRAINT "_FraccionToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AislamientoToReferenciaBibliografica" ADD CONSTRAINT "_AislamientoToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "aislamientos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AislamientoToReferenciaBibliografica" ADD CONSTRAINT "_AislamientoToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaracterizacionEstructuralToReferenciaBibliografica" ADD CONSTRAINT "_CaracterizacionEstructuralToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "caracterizaciones_estructurales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaracterizacionEstructuralToReferenciaBibliografica" ADD CONSTRAINT "_CaracterizacionEstructuralToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BioensayoToReferenciaBibliografica" ADD CONSTRAINT "_BioensayoToReferenciaBibliografica_A_fkey" FOREIGN KEY ("A") REFERENCES "bioensayos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BioensayoToReferenciaBibliografica" ADD CONSTRAINT "_BioensayoToReferenciaBibliografica_B_fkey" FOREIGN KEY ("B") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReferenciaBibliograficaToResultadoBioensayo" ADD CONSTRAINT "_ReferenciaBibliograficaToResultadoBioensayo_A_fkey" FOREIGN KEY ("A") REFERENCES "referencias_bibliograficas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReferenciaBibliograficaToResultadoBioensayo" ADD CONSTRAINT "_ReferenciaBibliograficaToResultadoBioensayo_B_fkey" FOREIGN KEY ("B") REFERENCES "resultados_bioensayo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddIntegrityConstraints
ALTER TABLE "muestras_botanicas"
ADD CONSTRAINT "muestras_botanicas_coordenadas_check"
CHECK (
    ("latitud" IS NULL AND "longitud" IS NULL)
    OR (
        "latitud" IS NOT NULL AND "longitud" IS NOT NULL
        AND "latitud" BETWEEN -90 AND 90
        AND "longitud" BETWEEN -180 AND 180
    )
);

CREATE UNIQUE INDEX "identificaciones_botanicas_una_vigente_por_muestra_key"
ON "identificaciones_botanicas"("muestraId")
WHERE "esVigente" = true;

ALTER TABLE "extractos"
ADD CONSTRAINT "extractos_masas_no_negativas_check"
CHECK (
    ("masaInicialMg" IS NULL OR "masaInicialMg" >= 0)
    AND ("masaExtractoMg" IS NULL OR "masaExtractoMg" >= 0)
    AND ("rendimientoPct" IS NULL OR "rendimientoPct" BETWEEN 0 AND 100)
    AND ("duracionMinutos" IS NULL OR "duracionMinutos" >= 0)
);

ALTER TABLE "fracciones"
ADD CONSTRAINT "fracciones_datos_no_negativos_check"
CHECK (
    ("masaMg" IS NULL OR "masaMg" >= 0)
    AND ("orden" IS NULL OR "orden" >= 0)
    AND ("fraccionPadreId" IS NULL OR "fraccionPadreId" <> "id")
);

ALTER TABLE "fracciones"
ADD CONSTRAINT "fracciones_fraccionPadreId_extractoId_fkey"
FOREIGN KEY ("fraccionPadreId", "extractoId")
REFERENCES "fracciones"("id", "extractoId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "aislamientos"
ADD CONSTRAINT "aislamientos_datos_no_negativos_check"
CHECK (
    ("purezaPct" IS NULL OR "purezaPct" BETWEEN 0 AND 100)
    AND ("masaAisladaMg" IS NULL OR "masaAisladaMg" >= 0)
);

ALTER TABLE "bioensayos"
ADD CONSTRAINT "bioensayos_rango_fechas_check"
CHECK (
    "fechaInicio" IS NULL
    OR "fechaFin" IS NULL
    OR "fechaFin" >= "fechaInicio"
);

ALTER TABLE "resultados_bioensayo"
ADD CONSTRAINT "resultados_bioensayo_material_unico_check"
CHECK (num_nonnulls("extractoId", "fraccionId", "moleculaId") = 1);

ALTER TABLE "resultados_bioensayo"
ADD CONSTRAINT "resultados_bioensayo_valores_check"
CHECK (
    ("concentracion" IS NULL OR "concentracion" >= 0)
    AND ("desviacionEstandar" IS NULL OR "desviacionEstandar" >= 0)
    AND ("replicados" IS NULL OR "replicados" > 0)
    AND (("concentracion" IS NULL) = ("unidadConcentracion" IS NULL))
    AND (("valor" IS NULL) = ("unidadResultado" IS NULL))
    AND (
        "valor" IS NOT NULL
        OR COALESCE(NULLIF(BTRIM("interpretacion"), '') IS NOT NULL, false)
    )
);

