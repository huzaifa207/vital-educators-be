/*
  Warnings:

  - You are about to drop the column `criminal_record_note` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `criminal_record_rejection_reason` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `criminal_record_status` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `license_note` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `license_rejection_reason` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `license_status` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `passport_note` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `passport_rejection_reason` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `passport_status` on the `Documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "criminal_record_note",
DROP COLUMN "criminal_record_rejection_reason",
DROP COLUMN "criminal_record_status",
DROP COLUMN "license_note",
DROP COLUMN "license_rejection_reason",
DROP COLUMN "license_status",
DROP COLUMN "passport_note",
DROP COLUMN "passport_rejection_reason",
DROP COLUMN "passport_status",
ADD COLUMN     "rejection_reason" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "status" "ApprovalStatus" NOT NULL DEFAULT 'NOT_ADDED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "requestedFirstName" TEXT,
ADD COLUMN     "requestedLastName" TEXT;
