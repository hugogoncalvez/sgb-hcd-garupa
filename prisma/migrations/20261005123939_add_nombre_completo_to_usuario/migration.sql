-- DropIndex
DROP INDEX "Libro_isbn_key";

-- AlterTable
ALTER TABLE "Libro" ADD COLUMN     "autorInstitucional" TEXT,
ADD COLUMN     "volumen" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "nombreCompleto" TEXT;

-- CreateTable
CREATE TABLE "Ejemplar" (
    "id" TEXT NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "tipoMaterial" TEXT,
    "ubicacion" TEXT,
    "codigoEstante" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "libroId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ejemplar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ejemplar_libroId_codigoInterno_key" ON "Ejemplar"("libroId", "codigoInterno");

-- AddForeignKey
ALTER TABLE "Ejemplar" ADD CONSTRAINT "Ejemplar_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libro"("id") ON DELETE CASCADE ON UPDATE CASCADE;
