-- CreateTable
CREATE TABLE "empresas_dispositivos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "tarjetas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "planes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresaId" INTEGER NOT NULL,
    "tarjetaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigoOperativo" TEXT,
    "cuotas" INTEGER NOT NULL,
    "pctComision" REAL NOT NULL,
    "pctArancel" REAL NOT NULL,
    "pctIVA" REAL NOT NULL,
    "pctIIBB" REAL NOT NULL,
    "baseIVA" TEXT NOT NULL DEFAULT 'COMISION_ARANCEL',
    "baseIIBB" TEXT NOT NULL DEFAULT 'MONTO_TARJETA',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "vigenciaDesde" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" DATETIME,
    CONSTRAINT "planes_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas_dispositivos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "planes_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "tarjetas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "interes_por_cuotas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cuotas" INTEGER NOT NULL,
    "interesTaller" REAL NOT NULL,
    "interesReal" REAL NOT NULL,
    "vigenciaDesde" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" DATETIME
);

-- CreateTable
CREATE TABLE "parametros_globales" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pctIVAporDefecto" REAL NOT NULL DEFAULT 0.21,
    "incluirIVAComoCosto" BOOLEAN NOT NULL DEFAULT false,
    "redondeoDecimales" INTEGER NOT NULL DEFAULT 2,
    "vigenciaDesde" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaHasta" DATETIME
);

-- CreateTable
CREATE TABLE "simulaciones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "montoEfectivo" REAL NOT NULL,
    "recargoClientePct" REAL NOT NULL,
    "empresaId" INTEGER NOT NULL,
    "tarjetaId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "cuotas" INTEGER NOT NULL,
    "resultados" TEXT NOT NULL,
    CONSTRAINT "simulaciones_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas_dispositivos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "simulaciones_tarjetaId_fkey" FOREIGN KEY ("tarjetaId") REFERENCES "tarjetas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "simulaciones_planId_fkey" FOREIGN KEY ("planId") REFERENCES "planes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_dispositivos_nombre_key" ON "empresas_dispositivos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tarjetas_nombre_key" ON "tarjetas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "planes_empresaId_tarjetaId_nombre_vigenciaDesde_key" ON "planes"("empresaId", "tarjetaId", "nombre", "vigenciaDesde");

-- CreateIndex
CREATE UNIQUE INDEX "interes_por_cuotas_cuotas_vigenciaDesde_key" ON "interes_por_cuotas"("cuotas", "vigenciaDesde");
