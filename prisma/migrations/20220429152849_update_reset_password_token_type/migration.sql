/*
  Warnings:

  - The `password_reset_token` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password_reset_token",
ADD COLUMN     "password_reset_token" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_password_reset_token_key" ON "User"("password_reset_token");
