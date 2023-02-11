/*
  Warnings:

  - A unique constraint covering the columns `[subscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StripePlan" AS ENUM ('NONE', 'BASE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PurchaseMethod" AS ENUM ('Credit', 'Stripe');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('Active', 'Deleted', 'Suspended');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('Open', 'Closed');

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptionId" INTEGER;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "comment_reply" TEXT NOT NULL DEFAULT E'',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "tutorId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPayment" (
    "userId" INTEGER NOT NULL,
    "customerId" TEXT NOT NULL DEFAULT E'',
    "credits" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PurchaseDispute" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT E'Open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openDescription" TEXT NOT NULL DEFAULT E'',
    "closeDescription" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "PurchaseDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPurchase" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "method" "PurchaseMethod" NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT E'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "plan" "StripePlan" NOT NULL DEFAULT E'NONE',
    "subscriptionId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT E'INACTIVE',
    "userId" INTEGER NOT NULL,
    "paymentMethodId" TEXT NOT NULL DEFAULT E'',
    "last4" TEXT NOT NULL DEFAULT E'',
    "brand" TEXT NOT NULL DEFAULT E'',
    "exp_month" INTEGER NOT NULL DEFAULT 0,
    "exp_year" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_success" BOOLEAN NOT NULL DEFAULT true,
    "started" INTEGER NOT NULL DEFAULT 0,
    "end" INTEGER NOT NULL DEFAULT 0,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPayment_userId_key" ON "StudentPayment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_customerId_key" ON "Subscription"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_subscriptionId_key" ON "User"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPayment" ADD CONSTRAINT "StudentPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseDispute" ADD CONSTRAINT "PurchaseDispute_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "StudentPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPurchase" ADD CONSTRAINT "StudentPurchase_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPurchase" ADD CONSTRAINT "StudentPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "StudentPayment"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
