import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    // Unpublished courses
    const unpublishedCourses = await prisma.course.findMany({
      where: {
        status: {
          in: ["Draft"],
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Incomplete courses (courses with no chapters or lessons)
    const allCourses = await prisma.course.findMany({
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
    });

    const incompleteCourses = allCourses
      .filter(
        (course) =>
          course.chapter.length === 0 ||
          course.chapter.every((ch) => ch.lessons.length === 0)
      )
      .map((course) => ({
        id: course.id,
        title: course.title,
        chaptersCount: course.chapter.length,
        lessonsCount: course.chapter.reduce(
          (sum, ch) => sum + ch.lessons.length,
          0
        ),
        user: {
          firstName: course.user.firstName,
          lastName: course.user.lastName,
        },
      }));

    // Courses missing thumbnails (fileKey is required, so check for empty string or invalid)
    const allCoursesForThumbnail = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        fileKey: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const coursesMissingThumbnails = allCoursesForThumbnail.filter(
      (course) => !course.fileKey || course.fileKey.trim() === ""
    );

    // Lessons without videos
    const lessonsWithoutVideos = await prisma.lesson.findMany({
      where: {
        OR: [
          { videoKey: null },
          { videoKey: "" },
        ],
      },
      include: {
        Chapter: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        videoKey: true,
        Chapter: {
          select: {
            Course: {
              select: {
                id: true,
                title: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      unpublishedCourses,
      incompleteCourses,
      coursesMissingThumbnails,
      lessonsWithoutVideos: lessonsWithoutVideos.map((lesson) => ({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        courseId: lesson.Chapter.Course.id,
        courseTitle: lesson.Chapter.Course.title,
        teacher: `${lesson.Chapter.Course.user.firstName} ${lesson.Chapter.Course.user.lastName || ""}`.trim(),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch content audit:", error);
    return NextResponse.json(
      { error: "Failed to fetch content audit" },
      { status: 500 }
    );
  }
}
