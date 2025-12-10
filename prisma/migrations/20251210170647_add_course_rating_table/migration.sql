-- CreateTable
CREATE TABLE "course_rating" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_rating_userId_courseId_key" ON "course_rating"("userId", "courseId");

-- CreateIndex
CREATE INDEX "course_rating_courseId_idx" ON "course_rating"("courseId");

-- CreateIndex
CREATE INDEX "course_rating_rating_idx" ON "course_rating"("rating");

-- CreateIndex
CREATE INDEX "course_rating_createdAt_idx" ON "course_rating"("createdAt");

-- AddForeignKey
ALTER TABLE "course_rating" ADD CONSTRAINT "course_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_rating" ADD CONSTRAINT "course_rating_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
