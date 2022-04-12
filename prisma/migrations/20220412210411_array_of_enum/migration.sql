/*
  Warnings:

  - The `availability` column on the `TutoringDetail` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TutoringDetail" DROP COLUMN "availability",
ADD COLUMN     "availability" TEXT[];
