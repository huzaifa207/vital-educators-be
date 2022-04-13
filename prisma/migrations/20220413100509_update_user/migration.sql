/*
  Warnings:

  - You are about to drop the column `promotion_third_parties` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `promotion_vital_educator` on the `Tutor` table. All the data in the column will be lost.
  - You are about to drop the column `search_visibility` on the `Tutor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tutor" DROP COLUMN "promotion_third_parties",
DROP COLUMN "promotion_vital_educator",
DROP COLUMN "search_visibility";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "promotion_third_parties" BOOLEAN DEFAULT false,
ADD COLUMN     "promotion_vital_educator" BOOLEAN DEFAULT false,
ADD COLUMN     "search_visibility" BOOLEAN DEFAULT false;
