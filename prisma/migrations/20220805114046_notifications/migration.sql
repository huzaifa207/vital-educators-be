-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('ALL', 'USER');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetType" "NotificationTargetType" NOT NULL,
    "targetId" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
