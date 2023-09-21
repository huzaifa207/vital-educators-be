/*
  Warnings:

  - You are about to drop the column `resourceType` on the `Resources` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resources" DROP COLUMN "resourceType",
ADD COLUMN     "fileType" TEXT NOT NULL DEFAULT E'URL';
