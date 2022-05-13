-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NOT_ADDED');

-- AlterTable
ALTER TABLE "Tutor" ADD COLUMN     "is_account_approved" "ApprovalStatus" NOT NULL DEFAULT E'PENDING',
ADD COLUMN     "is_government_document_approved" "ApprovalStatus" NOT NULL DEFAULT E'NOT_ADDED',
ADD COLUMN     "is_profile_pic_approved" "ApprovalStatus" NOT NULL DEFAULT E'NOT_ADDED',
ADD COLUMN     "is_qualification_document_approved" "ApprovalStatus" NOT NULL DEFAULT E'NOT_ADDED',
ADD COLUMN     "is_referee_approved" "ApprovalStatus" NOT NULL DEFAULT E'NOT_ADDED';
