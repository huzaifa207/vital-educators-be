/*
  Warnings:

  - Added the required column `documentId` to the `Qualification` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `document` on the `Qualification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Qualification" ADD COLUMN     "documentId" INTEGER NOT NULL,
DROP COLUMN "document",
ADD COLUMN     "document" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);
