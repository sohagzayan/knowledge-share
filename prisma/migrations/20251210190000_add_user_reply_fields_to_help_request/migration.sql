-- AlterTable
ALTER TABLE "help_request" ADD COLUMN IF NOT EXISTS "userReply" TEXT,
ADD COLUMN IF NOT EXISTS "userRepliedAt" TIMESTAMP(3);
