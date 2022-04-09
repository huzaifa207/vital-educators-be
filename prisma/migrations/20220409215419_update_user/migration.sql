-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email_approved" DROP NOT NULL,
ALTER COLUMN "email_token" DROP NOT NULL,
ALTER COLUMN "password_reset_token" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "updatedAt" DROP NOT NULL;
