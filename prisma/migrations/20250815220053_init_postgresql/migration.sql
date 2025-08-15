-- CreateEnum
CREATE TYPE "public"."BaseIVA" AS ENUM ('COMISION_ARANCEL', 'SOLO_COMISION', 'MONTO_EFECTIVO', 'MONTO_TARJETA');

-- CreateEnum
CREATE TYPE "public"."BaseIIBB" AS ENUM ('MONTO_TARJETA', 'MONTO_EFECTIVO');

-- CreateTable
CREATE TABLE "public"."empresas_dispositivos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "empresas_dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tarjetas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tarjetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."planes" (
    "id" SERIAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "tarjetaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoOperativo" TEXT,
    "cuotas" INTEGER NOT NULL,
    "pctComision" DOUBLE PRECISION NOT NULL,
    "pctArancel" DOUBLE PRECISION NOT NULL,
    "pctIVA" DOUBLE PRECISION NOT NULL,
    "pctIIBB" DOUBLE PRECISION NOT NULL,
    "baseIVA" "public"."BaseIVA" NOT NULL DEFAULT 'COMISION_ARANCEL',
    "baseIIBB" "public"."BaseIIBB" NOT NULL DEFAULT 'MONTO_TARJETA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" TIMESTAMP(3),

    CONSTRAINT "planes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interes_por_cuotas" (
    "id" SERIAL NOT NULL,
    "cuotas" INTEGER NOT NULL,
    "interesTaller" DOUBLE PRECISION NOT NULL,
    "interesReal" DOUBLE PRECISION NOT NULL,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" TIMESTAMP(3),

    CONSTRAINT "interes_por_cuotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parametros_globales" (
    "id" SERIAL NOT NULL,
    "pctIVAporDefecto" DOUBLE PRECISION NOT NULL DEFAULT 0.21,
    "incluirIVAComoCosto" BOOLEAN NOT NULL DEFAULT false,
    "redondeoDecimales" INTEGER NOT NULL DEFAULT 2,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" TIMESTAMP(3),

    CONSTRAINT "parametros_globales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."simulaciones" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoEfectivo" DOUBLE PRECISION NOT NULL,
    "recargoClientePct" DOUBLE PRECISION NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "tarjetaId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "cuotas" INTEGER NOT NULL,
    "resultados" TEXT NOT NULL,

    CONSTRAINT "simulaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_dispositivos_nombre_key" ON "public"."empresas_dispositivos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tarjetas_nombre_key" ON "public"."tarjetas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "planes_empresaId_tarjetaId_nombre_vigenciaDesde_key" ON "public"."planes"("empresaId", "tarjetaId", "nombre", "vigenciaDesde");

-- CreateIndex
CREATE UNIQUE INDEX "interes_por_cuotas_cuotas_vigenciaDesde_key" ON "public"."interes_por_cuotas"("cuotas", "vigenciaDesde");

-- AddForeignKey
ALTER TABLE "public"."planes" ADD CONSTRAINT "planes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."empresas_dispositivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."planes" ADD CONSTRAINT "planes_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "public"."tarjetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simulaciones" ADD CONSTRAINT "simulaciones_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "public"."empresas_dispositivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simulaciones" ADD CONSTRAINT "simulaciones_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "public"."tarjetas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simulaciones" ADD CONSTRAINT "simulaciones_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."planes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
