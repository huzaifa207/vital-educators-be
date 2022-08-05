-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "actionURL" TEXT NOT NULL,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);
