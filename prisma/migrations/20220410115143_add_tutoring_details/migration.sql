-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('WEEKENDS', 'WEEKDAYS', 'EVENING', 'MORNINIG');

-- CreateTable
CREATE TABLE "TutoringDetail" (
    "id" SERIAL NOT NULL,
    "about" TEXT NOT NULL,
    "year_of_experience" INTEGER NOT NULL,
    "teaching_experience" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "availability" "Availability" NOT NULL DEFAULT E'WEEKENDS',
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "TutoringDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutoringDetail_tutorId_key" ON "TutoringDetail"("tutorId");

-- AddForeignKey
ALTER TABLE "TutoringDetail" ADD CONSTRAINT "TutoringDetail_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
