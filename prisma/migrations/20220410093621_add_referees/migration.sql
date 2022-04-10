-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('FRIEND', 'TEACHER', 'COLLEAGE', 'CLIENT', 'EMPLOYER', 'OTHER');

-- CreateTable
CREATE TABLE "Referees" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" "RelationType" NOT NULL DEFAULT E'OTHER',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Referees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Referees_email_key" ON "Referees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Referees_userId_key" ON "Referees"("userId");

-- AddForeignKey
ALTER TABLE "Referees" ADD CONSTRAINT "Referees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
