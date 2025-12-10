import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      include: {
        chapter: {
          include: {
            lessons: {
              include: {
                lessonProgress: {
                  select: {
                    id: true,
                    userId: true,
                    completed: true,
                    updatedAt: true,
                  },
                },
                watchAnalytics: {
                  select: {
                    watchDuration: true,
                    totalDuration: true,
                    completionRate: true,
                  },
                },
              },
            },
          },
        },
        enrollment: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const totalEnrollments = course.enrollment.length;
    const lessons = course.chapter.flatMap((ch) => ch.lessons);

    const lessonAnalytics = lessons.map((lesson) => {
      const totalViews = lesson.lessonProgress.length;
      const completedViews = lesson.lessonProgress.filter((p) => p.completed).length;
      const watchRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;

      // Calculate average watch duration
      const watchData = lesson.watchAnalytics;
      const avgWatchDuration =
        watchData.length > 0
          ? watchData.reduce((sum, w) => sum + w.watchDuration, 0) /
            watchData.length
          : 0;
      const avgCompletionTime =
        watchData.length > 0
          ? watchData.reduce((sum, w) => sum + w.completionRate, 0) /
            watchData.length
          : 0;

      return {
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        totalViews,
        completedViews,
        watchRate: Math.round(watchRate),
        avgWatchDuration: Math.round(avgWatchDuration),
        avgCompletionRate: Math.round(avgCompletionTime),
        dropOffRate: totalViews > 0 ? Math.round(((totalViews - completedViews) / totalViews) * 100) : 0,
      };
    });

    // Find highest drop-off lesson
    const highestDropOff = lessonAnalytics.reduce((prev, current) =>
      prev.dropOffRate > current.dropOffRate ? prev : current
    );

    // Calculate average completion time
    const allWatchData = lessons.flatMap((l) => l.watchAnalytics);
    const avgCompletionTime =
      allWatchData.length > 0
        ? allWatchData.reduce((sum, w) => sum + w.completionRate, 0) /
          allWatchData.length
        : 0;

    return NextResponse.json({
      courseId: course.id,
      courseTitle: course.title,
      totalEnrollments,
      lessonAnalytics,
      highestDropOffLesson: highestDropOff,
      avgCompletionTime: Math.round(avgCompletionTime),
    });
  } catch (error) {
    console.error("Failed to fetch course analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch course analytics" },
      { status: 500 }
    );
  }
}
