/*
  Warnings:

  - You are about to drop the column `userId` on the `Referees` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tutorId]` on the table `Referees` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tutorId` to the `Referees` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Referees" DROP CONSTRAINT "Referees_userId_fkey";

-- DropIndex
DROP INDEX "Referees_userId_key";

-- AlterTable
ALTER TABLE "Referees" DROP COLUMN "userId",
ADD COLUMN     "tutorId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Referees_tutorId_key" ON "Referees"("tutorId");

-- AddForeignKey
ALTER TABLE "Referees" ADD CONSTRAINT "Referees_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
