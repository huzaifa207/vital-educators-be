/*
  Warnings:

  - Added the required column `resourceType` to the `Resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resources" ADD COLUMN     "resourceS3Key" TEXT,
ADD COLUMN     "resourceType" TEXT NOT NULL,
ALTER COLUMN "link" DROP NOT NULL;
