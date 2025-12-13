-- Add missing userReply and userRepliedAt columns to help_request table
ALTER TABLE "help_request" 
  ADD COLUMN IF NOT EXISTS "userReply" TEXT,
  ADD COLUMN IF NOT EXISTS "userRepliedAt" TIMESTAMP(3);
