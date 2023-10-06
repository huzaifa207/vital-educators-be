/*
  Warnings:

  - You are about to drop the column `criminal_record` on the `Documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "criminal_record",
ADD COLUMN     "criminal_record_url" TEXT NOT NULL DEFAULT E'';
