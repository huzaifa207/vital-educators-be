/*
  Warnings:

  - You are about to drop the column `seconday` on the `SubjectOffer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubjectOffer" DROP COLUMN "seconday",
ADD COLUMN     "secondary" INTEGER NOT NULL DEFAULT 0;
