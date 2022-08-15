-- CreateTable
CREATE TABLE "FlagedMessage" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "flaggedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN DEFAULT false,

    CONSTRAINT "FlagedMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FlagedMessage" ADD CONSTRAINT "FlagedMessage_flaggedById_fkey" FOREIGN KEY ("flaggedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlagedMessage" ADD CONSTRAINT "FlagedMessage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
