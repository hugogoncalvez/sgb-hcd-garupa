-- CreateEnum
CREATE TYPE "SocioEstado" AS ENUM ('ACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "PrestamoEstado" AS ENUM ('PRESTADO', 'DEVUELTO');

-- CreateTable
CREATE TABLE "Socio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "estado" "SocioEstado" NOT NULL DEFAULT 'ACTIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Socio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Libro" (
    "id" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "edicionAnio" TEXT NOT NULL,
    "descripcionFisica" TEXT,
    "clasificacion" TEXT NOT NULL,
    "cantidadEjemplares" INTEGER NOT NULL DEFAULT 1,
    "datosMarc" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Libro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "id" TEXT NOT NULL,
    "socioId" TEXT NOT NULL,
    "libroId" TEXT NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucionPrevista" TIMESTAMP(3) NOT NULL,
    "fechaDevolucionReal" TIMESTAMP(3),
    "estado" "PrestamoEstado" NOT NULL DEFAULT 'PRESTADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Socio_dni_key" ON "Socio"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Socio_email_key" ON "Socio"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Libro_isbn_key" ON "Libro"("isbn");

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prestamo" ADD CONSTRAINT "Prestamo_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
