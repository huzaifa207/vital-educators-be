-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "isArchived" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isArchived" BOOLEAN DEFAULT false;
