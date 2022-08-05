/*
  Warnings:

  - The values [ALL] on the enum `NotificationTargetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationTargetType_new" AS ENUM ('GLOBAL', 'USER');
ALTER TABLE "Notification" ALTER COLUMN "targetType" TYPE "NotificationTargetType_new" USING ("targetType"::text::"NotificationTargetType_new");
ALTER TYPE "NotificationTargetType" RENAME TO "NotificationTargetType_old";
ALTER TYPE "NotificationTargetType_new" RENAME TO "NotificationTargetType";
DROP TYPE "NotificationTargetType_old";
COMMIT;
