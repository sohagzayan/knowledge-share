-- CreateEnum
CREATE TYPE "BanType" AS ENUM ('Temporary', 'Permanent');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banType" "BanType",
ADD COLUMN     "banUntil" TIMESTAMP(3),
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "followUpEmailSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3);
