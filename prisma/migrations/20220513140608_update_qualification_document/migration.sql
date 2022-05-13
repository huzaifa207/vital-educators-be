/*
  Warnings:

  - You are about to drop the column `documentId` on the `Qualification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Qualification" DROP COLUMN "documentId",
ALTER COLUMN "document" SET DATA TYPE TEXT;
