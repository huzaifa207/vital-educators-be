-- DropForeignKey
ALTER TABLE "Referees" DROP CONSTRAINT "Referees_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "Tutor" DROP CONSTRAINT "Tutor_userId_fkey";

-- CreateTable
CREATE TABLE "Qualification" (
    "id" SERIAL NOT NULL,
    "degree_title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "intitute" TEXT NOT NULL,
    "year_of_completion" INTEGER NOT NULL,
    "document" TEXT NOT NULL,
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referees" ADD CONSTRAINT "Referees_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
