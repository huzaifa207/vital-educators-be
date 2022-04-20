-- CreateTable
CREATE TABLE "RefereesReviews" (
    "refereeId" INTEGER NOT NULL,
    "reliability_rating" INTEGER NOT NULL,
    "trust_rating" INTEGER NOT NULL,
    "professionalism_rating" INTEGER NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RefereesReviews_refereeId_key" ON "RefereesReviews"("refereeId");

-- AddForeignKey
ALTER TABLE "RefereesReviews" ADD CONSTRAINT "RefereesReviews_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Referees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
