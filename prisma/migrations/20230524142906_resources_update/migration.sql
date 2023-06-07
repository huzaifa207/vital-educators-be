/*
  Warnings:

  - Added the required column `slug` to the `Resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resources" ADD COLUMN     "slug" TEXT NOT NULL;
