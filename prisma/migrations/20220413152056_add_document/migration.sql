-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "id_card_front" TEXT NOT NULL,
    "id_card_back" TEXT NOT NULL,
    "criminal_record" TEXT NOT NULL,
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documents_tutorId_key" ON "Documents"("tutorId");

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
