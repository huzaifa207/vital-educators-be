/*
  Warnings:

  - You are about to drop the column `id_card_back` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `id_card_front` on the `Documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "id_card_back",
DROP COLUMN "id_card_front",
ADD COLUMN     "license_url" TEXT NOT NULL DEFAULT E'',
ADD COLUMN     "passport_url" TEXT NOT NULL DEFAULT E'',
ALTER COLUMN "criminal_record" SET DEFAULT E'';
