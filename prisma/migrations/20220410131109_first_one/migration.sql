-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'TUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('FRIEND', 'TEACHER', 'COLLEAGE', 'CLIENT', 'EMPLOYER', 'OTHER');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('WEEKENDS', 'WEEKDAYS', 'EVENING', 'MORNINIG');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address_1" TEXT NOT NULL,
    "address_2" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "email_approved" TEXT,
    "email_token" TEXT,
    "password_reset_token" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT E'STUDENT',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Referees" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" "RelationType" NOT NULL DEFAULT E'OTHER',
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "Referees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" SERIAL NOT NULL,
    "degree_title" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "institute" TEXT NOT NULL,
    "year_of_completion" INTEGER NOT NULL,
    "document" TEXT NOT NULL,
    "tutorId" INTEGER NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Tutor_userId_key" ON "Tutor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referees_email_key" ON "Referees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TutoringDetail_tutorId_key" ON "TutoringDetail"("tutorId");

-- AddForeignKey
ALTER TABLE "Tutor" ADD CONSTRAINT "Tutor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referees" ADD CONSTRAINT "Referees_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TutoringDetail" ADD CONSTRAINT "TutoringDetail_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
