-- AlterTable
ALTER TABLE "AssignmentSubmission" ADD COLUMN     "description" TEXT,
ADD COLUMN     "link" TEXT,
ADD COLUMN     "submissionCount" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "fileKey" DROP NOT NULL;
