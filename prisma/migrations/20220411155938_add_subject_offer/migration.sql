-- CreateTable
CREATE TABLE "SubjectOffer" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "primary" INTEGER NOT NULL DEFAULT 0,
    "seconday" INTEGER NOT NULL DEFAULT 0,
    "gsce" INTEGER NOT NULL DEFAULT 0,
    "higher_education" INTEGER NOT NULL DEFAULT 0,
    "casual_learner" INTEGER NOT NULL DEFAULT 0,
    "a_level" INTEGER NOT NULL DEFAULT 0,
    "online_discount" INTEGER NOT NULL DEFAULT 0,
    "first_free_lesson" BOOLEAN NOT NULL DEFAULT false,
    "in_person" BOOLEAN NOT NULL DEFAULT true,
    "online" BOOLEAN NOT NULL DEFAULT true,
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "SubjectOffer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubjectOffer" ADD CONSTRAINT "SubjectOffer_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
