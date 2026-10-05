/*
  Warnings:

  - You are about to drop the column `edicionAnio` on the `Libro` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Libro" DROP COLUMN "edicionAnio",
ADD COLUMN     "anioPublicacion" TEXT,
ADD COLUMN     "bibliotecario" TEXT,
ADD COLUMN     "colaboradores" TEXT,
ADD COLUMN     "descriptores" TEXT,
ADD COLUMN     "edicion" TEXT,
ADD COLUMN     "editorial" TEXT,
ADD COLUMN     "idioma" TEXT,
ADD COLUMN     "inventario" TEXT,
ADD COLUMN     "lugarPublicacion" TEXT,
ADD COLUMN     "notaGeneral" TEXT,
ADD COLUMN     "temas" TEXT,
ADD COLUMN     "tipoMaterial" TEXT,
ADD COLUMN     "ubicacion" TEXT,
ALTER COLUMN "isbn" DROP NOT NULL,
ALTER COLUMN "autor" DROP NOT NULL,
ALTER COLUMN "titulo" DROP NOT NULL,
ALTER COLUMN "clasificacion" DROP NOT NULL;
