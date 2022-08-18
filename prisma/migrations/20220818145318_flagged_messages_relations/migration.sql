/*
  Warnings:

  - You are about to drop the column `flaggedById` on the `FlaggedMessage` table. All the data in the column will be lost.
  - You are about to drop the column `messageId` on the `FlaggedMessage` table. All the data in the column will be lost.
  - Added the required column `message` to the `FlaggedMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentById` to the `FlaggedMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sentToId` to the `FlaggedMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FlaggedMessage" DROP CONSTRAINT "FlaggedMessage_flaggedById_fkey";

-- DropForeignKey
ALTER TABLE "FlaggedMessage" DROP CONSTRAINT "FlaggedMessage_messageId_fkey";

-- AlterTable
ALTER TABLE "FlaggedMessage" DROP COLUMN "flaggedById",
DROP COLUMN "messageId",
ADD COLUMN     "message" TEXT NOT NULL,
ADD COLUMN     "sentById" INTEGER NOT NULL,
ADD COLUMN     "sentToId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FlaggedMessage" ADD CONSTRAINT "FlaggedMessage_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlaggedMessage" ADD CONSTRAINT "FlaggedMessage_sentToId_fkey" FOREIGN KEY ("sentToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
