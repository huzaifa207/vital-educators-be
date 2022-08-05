-- CreateEnum
CREATE TYPE "NotificationRole" AS ENUM ('STUDENT', 'TUTOR', 'ALL');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "role" "NotificationRole" NOT NULL DEFAULT E'ALL';
