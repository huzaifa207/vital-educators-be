-- AlterTable
ALTER TABLE "Chats" ADD COLUMN     "seen" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "tutorReply" BOOLEAN NOT NULL DEFAULT false;
