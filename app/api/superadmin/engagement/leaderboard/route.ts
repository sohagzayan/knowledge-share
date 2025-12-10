import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    // Get all students with their activity
    const students = await prisma.user.findMany({
      where: {
        OR: [
          { role: "user" },
          { role: null },
        ],
        enrollment: {
          some: {},
        },
      },
      include: {
        enrollment: {
          include: {
            Course: {
              include: {
                chapter: {
                  include: {
                    lessons: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        lessonProgress: {
          where: {
            completed: true,
          },
          select: {
            id: true,
            lessonId: true,
            updatedAt: true,
          },
        },
        watchAnalytics: {
          select: {
            watchDuration: true,
          },
        },
      },
    });

    const leaderboard = students.map((student) => {
      // Calculate consistency (days active in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeDays = new Set(
        student.lessonProgress
          .filter((p) => new Date(p.updatedAt) >= thirtyDaysAgo)
          .map((p) => new Date(p.updatedAt).toDateString())
      ).size;

      // Calculate hours watched
      const totalSeconds = student.watchAnalytics.reduce(
        (sum, w) => sum + w.watchDuration,
        0
      );
      const hoursWatched = Math.round((totalSeconds / 3600) * 10) / 10;

      // Calculate courses completed
      const coursesCompleted = student.enrollment.filter((enrollment) => {
        const course = enrollment.Course;
        const totalLessons = course.chapter.reduce(
          (sum, ch) => sum + ch.lessons.length,
          0
        );
        const completedLessons = student.lessonProgress.filter((p) =>
          course.chapter.some((ch) =>
            ch.lessons.some((l) => l.id === p.lessonId)
          )
        ).length;
        return totalLessons > 0 && completedLessons >= totalLessons;
      }).length;

      return {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName || ""}`.trim(),
        email: student.email,
        image: student.image,
        consistency: activeDays,
        hoursWatched,
        coursesCompleted,
        totalEnrollments: student.enrollment.length,
        totalLessonsCompleted: student.lessonProgress.length,
      };
    });

    // Sort by consistency, then hours watched, then courses completed
    leaderboard.sort((a, b) => {
      if (b.consistency !== a.consistency) {
        return b.consistency - a.consistency;
      }
      if (b.hoursWatched !== a.hoursWatched) {
        return b.hoursWatched - a.hoursWatched;
      }
      return b.coursesCompleted - a.coursesCompleted;
    });

    // Top 10
    const topStudents = leaderboard.slice(0, 10).map((student, index) => ({
      ...student,
      rank: index + 1,
    }));

    return NextResponse.json(topStudents);
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
