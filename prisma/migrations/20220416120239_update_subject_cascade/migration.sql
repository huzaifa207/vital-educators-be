-- DropForeignKey
ALTER TABLE "SubjectOffer" DROP CONSTRAINT "SubjectOffer_tutorId_fkey";

-- AddForeignKey
ALTER TABLE "SubjectOffer" ADD CONSTRAINT "SubjectOffer_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
