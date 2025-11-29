import "server-only";
import { requireUser } from "../user/require-user";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export async function getLessonContent(lessonId: string) {
  const session = await requireUser();

  // Get user's points
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { points: true },
  });

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      title: true,
      description: true,
      thumbnailKey: true,
      videoKey: true,
      position: true,
      status: true,
      releaseAt: true,
      lessonProgress: {
        where: {
          userId: session.id,
        },
        select: {
          completed: true,
          lessonId: true,
        },
      },
      Chapter: {
        select: {
          id: true,
          courseId: true,
          position: true,
          status: true,
          releaseAt: true,
          Course: {
            select: {
              slug: true,
            },
          },
        },
      },
      assignment: {
        select: {
          id: true,
          title: true,
          description: true,
          fileKey: true,
          points: true,
          dueDate: true,
          submissions: {
            where: {
              userId: session.id,
            },
            select: {
              id: true,
              fileKey: true,
              link: true,
              description: true,
              submissionCount: true,
              status: true,
              grade: true,
              feedback: true,
              submittedAt: true,
            },
            take: 1,
            orderBy: {
              submittedAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    return notFound();
  }

  // Enforce chapter / lesson publish status & schedule unless early unlocked
  const earlyUnlock = await prisma.earlyUnlock.findFirst({
    where: {
      userId: session.id,
      OR: [
        { lessonId: lesson.id },
        { chapterId: lesson.Chapter.id },
      ],
    },
  });

  const now = new Date();
  
  // Chapter is locked ONLY if:
  // - Status is Draft
  // Note: Scheduled/Published chapters with future releaseAt are accessible (will show countdown)
  const chapterScheduledLocked = lesson.Chapter.status === "Draft";

  // Lesson is locked ONLY if:
  // - Status is Draft
  // Note: Scheduled/Published lessons with future releaseAt are accessible (will show countdown UI)
  const lessonScheduledLocked = lesson.status === "Draft";

  // Only block Draft lessons/chapters
  // Scheduled/Published with future releaseAt should be accessible to show countdown
  if (chapterScheduledLocked || lessonScheduledLocked) {
    return notFound();
  }
  
  // Check if lesson is scheduled (Published but with future releaseAt)
  const isLessonScheduled = 
    (lesson.status === "Published" || lesson.status === "Scheduled") &&
    !!lesson.releaseAt &&
    new Date(lesson.releaseAt) > now &&
    !earlyUnlock?.lessonId;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.id,
        courseId: lesson.Chapter.courseId,
      },
    },
    select: {
      status: true,
    },
  });

  if (!enrollment || enrollment.status !== "Active") {
    return notFound();
  }

  // Get all lessons in the course to find previous and next
  const allLessons = await prisma.lesson.findMany({
    where: {
      Chapter: {
        courseId: lesson.Chapter.courseId,
      },
    },
    select: {
      id: true,
      title: true,
      position: true,
      Chapter: {
        select: {
          id: true,
          position: true,
        },
      },
    },
    orderBy: [
      {
        Chapter: {
          position: "asc",
        },
      },
      {
        position: "asc",
      },
    ],
  });

  // Get all lesson progress for the user
  const allLessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: session.id,
      lessonId: {
        in: allLessons.map((l) => l.id),
      },
      completed: true,
    },
    select: {
      lessonId: true,
    },
  });

  const completedLessonIds = new Set(allLessonProgress.map((lp) => lp.lessonId));

  // Calculate current lesson index
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Check if current lesson is completed
  const isCurrentLessonCompleted = completedLessonIds.has(lessonId);

  // Check if current lesson has assignment and if it's submitted
  const hasAssignment = !!lesson.assignment;
  const assignmentSubmitted = lesson.assignment?.submissions && lesson.assignment.submissions.length > 0;
  const assignmentRequired = hasAssignment && !assignmentSubmitted;

  // Check if current lesson is locked (previous lesson must be completed)
  let isCurrentLessonLocked = false;
  if (currentIndex > 0) {
    const previousLesson = allLessons[currentIndex - 1];
    const isPreviousCompleted = completedLessonIds.has(previousLesson.id);
    
    // Also check if previous lesson had assignment and if it was submitted
    const previousLessonData = await prisma.lesson.findUnique({
      where: { id: previousLesson.id },
      select: {
        assignment: {
          select: {
            submissions: {
              where: { userId: session.id },
              select: { id: true },
              take: 1,
            },
          },
        },
      },
    });
    
    const previousHasAssignment = !!previousLessonData?.assignment;
    const previousAssignmentSubmitted = previousLessonData?.assignment?.submissions && previousLessonData.assignment.submissions.length > 0;
    const previousAssignmentRequired = previousHasAssignment && !previousAssignmentSubmitted;
    
    // Previous lesson must be completed AND if it has assignment, it must be submitted
    isCurrentLessonLocked = !isPreviousCompleted || previousAssignmentRequired;
  }

  // Check if next lesson should be locked
  // Next lesson is locked if:
  // 1. Current lesson is not completed, OR
  // 2. Current lesson has assignment and it's not submitted
  const isNextLessonLocked = nextLesson ? (!isCurrentLessonCompleted || assignmentRequired) : false;

  // If current lesson is locked by progression, return not found (prevent access)
  // BUT: if lesson is scheduled (Published/Scheduled with future releaseAt), allow access to show countdown
  if (isCurrentLessonLocked && !isLessonScheduled) {
    return notFound();
  }

  return {
    ...lesson,
    previousLesson: previousLesson
      ? {
          id: previousLesson.id,
          title: previousLesson.title,
        }
      : null,
    nextLesson: nextLesson
      ? {
          id: nextLesson.id,
          title: nextLesson.title,
          locked: isNextLessonLocked,
        }
      : null,
    isCurrentLessonCompleted,
    assignmentRequired,
    userPoints: user?.points || 0,
    isScheduled: isLessonScheduled,
    isEarlyUnlocked: !!earlyUnlock?.lessonId,
  };
}

export type LessonContentType = Awaited<ReturnType<typeof getLessonContent>>;
