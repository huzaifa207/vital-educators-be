/*
  Warnings:

  - You are about to drop the column `type` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Media` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('RESOURCE', 'DOCUMENT', 'MEDIA');

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "type",
DROP COLUMN "url",
ADD COLUMN     "fileType" "FileType" NOT NULL DEFAULT E'MEDIA',
ADD COLUMN     "link" TEXT;
