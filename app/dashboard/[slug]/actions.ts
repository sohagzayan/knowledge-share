"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

const EARLY_UNLOCK_COST_CHAPTER = 10; // Points needed to unlock chapter early
const EARLY_UNLOCK_COST_LESSON = 7; // Points needed to unlock lesson early

export async function unlockChapterEarly(
  chapterId: string,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();

  try {
    // Get user's current points
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { points: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    // Check if user has enough points
    if (user.points < EARLY_UNLOCK_COST_CHAPTER) {
      return {
        status: "error",
        message: `Insufficient points. You need ${EARLY_UNLOCK_COST_CHAPTER} points but only have ${user.points} points.`,
      };
    }

    // Get chapter details
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        releaseAt: true,
        position: true,
        courseId: true,
        Course: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!chapter) {
      return {
        status: "error",
        message: "Chapter not found",
      };
    }

    // Check if chapter is already released
    if (!chapter.releaseAt || new Date(chapter.releaseAt) <= new Date()) {
      return {
        status: "error",
        message: "Chapter is already available",
      };
    }

    // Check that all previous chapters' lessons are completed before allowing early unlock
    const allChapters = await prisma.chapter.findMany({
      where: {
        courseId: chapter.courseId,
      },
      select: {
        id: true,
        position: true,
        lessons: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    const currentChapterIndex = allChapters.findIndex((ch) => ch.id === chapterId);
    if (currentChapterIndex === -1) {
      return {
        status: "error",
        message: "Chapter not found in course",
      };
    }

    // Get all lessons from previous chapters
    const previousChapters = allChapters.slice(0, currentChapterIndex);
    const previousChapterLessonIds = previousChapters.flatMap((ch) => ch.lessons.map((l) => l.id));

    if (previousChapterLessonIds.length > 0) {
      // Get all completed lessons for the user
      const completedLessons = await prisma.lessonProgress.findMany({
        where: {
          userId: session.id,
          lessonId: {
            in: previousChapterLessonIds,
          },
          completed: true,
        },
        select: {
          lessonId: true,
        },
      });

      const completedLessonIds = new Set(completedLessons.map((lp) => lp.lessonId));

      // Get all lessons with assignments and their submissions
      const lessonsWithAssignments = await prisma.lesson.findMany({
        where: {
          id: {
            in: previousChapterLessonIds,
          },
          assignment: {
            isNot: null,
          },
        },
        select: {
          id: true,
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

      const assignmentSubmissionMap = new Map<string, boolean>();
      lessonsWithAssignments.forEach((l) => {
        const hasSubmission = l.assignment?.submissions && l.assignment.submissions.length > 0;
        assignmentSubmissionMap.set(l.id, !!hasSubmission);
      });

      // Check if all previous chapters' lessons are completed
      for (const lessonId of previousChapterLessonIds) {
        const isCompleted = completedLessonIds.has(lessonId);
        const hasAssignment = assignmentSubmissionMap.has(lessonId);
        const assignmentSubmitted = hasAssignment 
          ? assignmentSubmissionMap.get(lessonId) 
          : true; // If no assignment, consider it "submitted"

        if (!isCompleted || (hasAssignment && !assignmentSubmitted)) {
          return {
            status: "error",
            message: "You must complete all previous chapters' lessons before unlocking this chapter early.",
          };
        }
      }
    }

    // Deduct points
    await prisma.user.update({
      where: { id: session.id },
      data: {
        points: {
          decrement: EARLY_UNLOCK_COST_CHAPTER,
        },
      },
    });

    // Create early unlock record
    await prisma.earlyUnlock.upsert({
      where: {
        userId_chapterId_lessonId: {
          userId: session.id,
          chapterId: chapterId,
          lessonId: null,
        },
      },
      create: {
        userId: session.id,
        chapterId: chapterId,
        lessonId: null,
        pointsSpent: EARLY_UNLOCK_COST_CHAPTER,
      },
      update: {
        pointsSpent: EARLY_UNLOCK_COST_CHAPTER,
        unlockedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: `Chapter unlocked early! (-${EARLY_UNLOCK_COST_CHAPTER} points)`,
    };
  } catch (error) {
    console.error("Failed to unlock chapter early:", error);
    return {
      status: "error",
      message: "Failed to unlock chapter. Please try again.",
    };
  }
}

export async function unlockLessonEarly(
  lessonId: string,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { points: true },
    });

    if (!user) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    if (user.points < EARLY_UNLOCK_COST_LESSON) {
      return {
        status: "error",
        message: `Insufficient points. You need ${EARLY_UNLOCK_COST_LESSON} points but only have ${user.points} points.`,
      };
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        releaseAt: true,
        position: true,
        Chapter: {
          select: {
            id: true,
            position: true,
            courseId: true,
            Course: { select: { slug: true } },
          },
        },
      },
    });

    if (!lesson) {
      return {
        status: "error",
        message: "Lesson not found",
      };
    }

    // If already released no need to unlock
    if (!lesson.releaseAt || new Date(lesson.releaseAt) <= new Date()) {
      return {
        status: "error",
        message: "Lesson is already available",
      };
    }

    // Check that all previous lessons are completed before allowing early unlock
    const allLessons = await prisma.lesson.findMany({
      where: {
        Chapter: {
          courseId: lesson.Chapter.courseId,
        },
      },
      select: {
        id: true,
        position: true,
        Chapter: {
          select: {
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

    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);
    if (currentLessonIndex === -1) {
      return {
        status: "error",
        message: "Lesson not found in course",
      };
    }

    // Get all completed lessons for the user
    const completedLessons = await prisma.lessonProgress.findMany({
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

    const completedLessonIds = new Set(completedLessons.map((lp) => lp.lessonId));

    // Get all lessons with assignments and their submissions
    const lessonsWithAssignments = await prisma.lesson.findMany({
      where: {
        Chapter: {
          courseId: lesson.Chapter.courseId,
        },
        assignment: {
          isNot: null,
        },
      },
      select: {
        id: true,
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

    const assignmentSubmissionMap = new Map<string, boolean>();
    lessonsWithAssignments.forEach((l) => {
      const hasSubmission = l.assignment?.submissions && l.assignment.submissions.length > 0;
      assignmentSubmissionMap.set(l.id, !!hasSubmission);
    });

    // Check if all previous lessons are completed
    for (let i = 0; i < currentLessonIndex; i++) {
      const prevLesson = allLessons[i];
      const isCompleted = completedLessonIds.has(prevLesson.id);
      const hasAssignment = assignmentSubmissionMap.has(prevLesson.id);
      const assignmentSubmitted = hasAssignment 
        ? assignmentSubmissionMap.get(prevLesson.id) 
        : true; // If no assignment, consider it "submitted"

      if (!isCompleted || (hasAssignment && !assignmentSubmitted)) {
        return {
          status: "error",
          message: "You must complete all previous lessons before unlocking this lesson early.",
        };
      }
    }

    await prisma.user.update({
      where: { id: session.id },
      data: {
        points: {
          decrement: EARLY_UNLOCK_COST_LESSON,
        },
      },
    });

    await prisma.earlyUnlock.upsert({
      where: {
        userId_chapterId_lessonId: {
          userId: session.id,
          chapterId: null,
          lessonId: lessonId,
        },
      },
      create: {
        userId: session.id,
        chapterId: null,
        lessonId: lessonId,
        pointsSpent: EARLY_UNLOCK_COST_LESSON,
      },
      update: {
        pointsSpent: EARLY_UNLOCK_COST_LESSON,
        unlockedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: `Lesson unlocked early! (-${EARLY_UNLOCK_COST_LESSON} points)`,
    };
  } catch (error) {
    console.error("Failed to unlock lesson early:", error);
    return {
      status: "error",
      message: "Failed to unlock lesson. Please try again.",
    };
  }
}

