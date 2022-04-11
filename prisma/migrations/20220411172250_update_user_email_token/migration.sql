/*
  Warnings:

  - The `email_approved` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_approved",
ADD COLUMN     "email_approved" BOOLEAN;
