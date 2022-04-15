/*
  Warnings:

  - You are about to drop the column `profile_url` on the `Tutor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tutor" DROP COLUMN "profile_url";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile_url" TEXT NOT NULL DEFAULT E'';
