import { NextResponse } from "next/server";
import { prisma, withRetry } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    // Get all teachers (users who created courses)
    // Use retry wrapper to handle transient connection failures
    const teachers = await withRetry(async () => {
      return await prisma.user.findMany({
      where: {
        courses: {
          some: {},
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        createdAt: true,
        courses: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            enrollment: {
              select: {
                id: true,
                amount: true,
                userId: true,
                createdAt: true,
              },
            },
            chapter: {
              select: {
                id: true,
                lessons: {
                  select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    lessonProgress: {
                      where: {
                        completed: true,
                      },
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        },
        activityLogs: {
          select: {
            id: true,
            action: true,
            createdAt: true,
          },
        },
      },
    });
    }, 3, 1000); // Retry up to 3 times with exponential backoff starting at 1s

    const teacherPerformance = teachers.map((teacher) => {
      const totalCourses = teacher.courses?.length || 0;
      const allEnrollments = teacher.courses?.flatMap((c) => c.enrollment || []) || [];
      const totalStudents = new Set(allEnrollments.map((e) => e.userId).filter(Boolean)).size;
      const totalRevenue = allEnrollments.reduce((sum, e) => sum + (e.amount || 0), 0);

      // Calculate total hours of content (estimate: 30 min per lesson)
      const totalLessons = (teacher.courses || []).reduce(
        (sum, course) =>
          sum +
          (course.chapter || []).reduce(
            (chSum, ch) => chSum + (ch.lessons?.length || 0),
            0
          ),
        0
      );
      const totalHours = Math.round((totalLessons * 0.5) * 10) / 10;

      // Calculate average course rating
      const allRatings = teacher.courses?.flatMap((c) => c.ratings || []) || [];
      const avgRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length
          : 0;

      // Calculate completion rate
      let totalCompletionRate = 0;
      let coursesWithData = 0;

      (teacher.courses || []).forEach((course) => {
        const enrollments = course.enrollment?.length || 0;
        if (enrollments > 0) {
          const totalLessons = (course.chapter || []).reduce(
            (sum, ch) => sum + (ch.lessons?.length || 0),
            0
          );
          const completedLessons = (course.chapter || []).reduce(
            (sum, ch) =>
              sum +
              (ch.lessons || []).reduce(
                (lSum, lesson) => lSum + (lesson.lessonProgress?.length || 0),
                0
              ),
            0
          );
          const completionRate =
            totalLessons > 0
              ? (completedLessons / (totalLessons * enrollments)) * 100
              : 0;
          totalCompletionRate += completionRate;
          coursesWithData++;
        }
      });

      const avgCompletionRate =
        coursesWithData > 0
          ? Math.round(totalCompletionRate / coursesWithData)
          : 0;

      // Count activity logs
      const uploadActivity = (teacher.activityLogs || []).filter(
        (log) => log.action === "lesson_uploaded" || log.action === "course_created"
      ).length;

      return {
        teacherId: teacher.id,
        teacherName: `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim(),
        email: teacher.email,
        image: teacher.image,
        totalStudents,
        totalCourses,
        totalHours,
        avgRating: Math.round(avgRating * 10) / 10,
        avgCompletionRate: Math.min(avgCompletionRate, 100),
        totalRevenue,
        uploadActivity,
        joinedAt: teacher.createdAt.toISOString(),
      };
    });

    // Sort by total revenue for ranking
    teacherPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Add ranking
    const rankedTeachers = teacherPerformance.map((teacher, index) => ({
      ...teacher,
      rank: index + 1,
    }));

    return NextResponse.json(rankedTeachers);
  } catch (error: any) {
    console.error("Failed to fetch teacher performance:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
      name: error?.name,
    });
    
    // Handle redirect errors (from requireSuperAdmin)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      return NextResponse.json(
        { error: "Unauthorized. Super admin access required." },
        { status: 403 }
      );
    }

    // Return more detailed error information in development
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error?.message || error?.toString() || "Failed to fetch teacher performance"
      : "Failed to fetch teacher performance";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
