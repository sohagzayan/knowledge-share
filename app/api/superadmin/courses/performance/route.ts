import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    const courses = await prisma.course.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            userId: true,
            createdAt: true,
            certificateEarned: true,
          },
        },
        chapter: {
          include: {
            lessons: {
              include: {
                lessonProgress: {
                  where: {
                    completed: true,
                  },
                  select: {
                    id: true,
                    userId: true,
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
    });

    const coursePerformance = courses.map((course) => {
      const totalEnrollments = course.enrollment.length;
      const uniqueStudents = new Set(course.enrollment.map((e) => e.userId)).size;
      const certificatesEarned = course.enrollment.filter(
        (e) => e.certificateEarned
      ).length;

      // Calculate completion rate
      const totalLessons = course.chapter.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0
      );
      const totalPossibleCompletions = totalLessons * totalEnrollments;
      const actualCompletions = course.chapter.reduce(
        (sum, ch) =>
          sum +
          ch.lessons.reduce(
            (lSum, lesson) => lSum + lesson.lessonProgress.length,
            0
          ),
        0
      );
      const completionRate =
        totalPossibleCompletions > 0
          ? Math.round((actualCompletions / totalPossibleCompletions) * 100)
          : 0;

      // Calculate average rating
      const avgRating =
        course.ratings.length > 0
          ? course.ratings.reduce((sum, r) => sum + r.rating, 0) /
            course.ratings.length
          : 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        teacher: `${course.user.firstName} ${course.user.lastName || ""}`.trim(),
        category: course.category,
        status: course.status,
        totalEnrollments,
        uniqueStudents,
        completionRate: Math.min(completionRate, 100),
        certificatesEarned,
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings: course.ratings.length,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };
    });

    // Sort by enrollments
    coursePerformance.sort((a, b) => b.totalEnrollments - a.totalEnrollments);

    return NextResponse.json(coursePerformance);
  } catch (error) {
    console.error("Failed to fetch course performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch course performance" },
      { status: 500 }
    );
  }
}
