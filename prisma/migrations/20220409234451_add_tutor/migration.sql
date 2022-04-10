-- CreateTable
CREATE TABLE "Tutor" (
    "id" SERIAL NOT NULL,
    "profile_url" TEXT NOT NULL,
    "crb_check" BOOLEAN NOT NULL,
    "skype_id" TEXT NOT NULL,
    "search_visibility" BOOLEAN NOT NULL,
    "promotion_vital_educator" BOOLEAN NOT NULL,
    "promotion_third_parties" BOOLEAN NOT NULL,
    "deActivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Tutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_userId_key" ON "Tutor"("userId");

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
