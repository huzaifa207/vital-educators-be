/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `whitelist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "whitelist_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "whitelist_token_key" ON "whitelist"("token");
