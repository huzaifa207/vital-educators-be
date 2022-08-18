/*
  Warnings:

  - You are about to drop the `FlagedMessage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FlagedMessage" DROP CONSTRAINT "FlagedMessage_flaggedById_fkey";

-- DropForeignKey
ALTER TABLE "FlagedMessage" DROP CONSTRAINT "FlagedMessage_messageId_fkey";

-- DropTable
DROP TABLE "FlagedMessage";

-- CreateTable
CREATE TABLE "FlaggedMessage" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "flaggedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN DEFAULT false,

    CONSTRAINT "FlaggedMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlaggedMessage" ADD CONSTRAINT "FlaggedMessage_flaggedById_fkey" FOREIGN KEY ("flaggedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlaggedMessage" ADD CONSTRAINT "FlaggedMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
