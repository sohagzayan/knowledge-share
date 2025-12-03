import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetCourses() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  await requireAdmin();

  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      price: true,
      fileKey: true,
      slug: true,
      createdAt: true,
      category: true,
      _count: {
        select: {
          enrollment: {
            where: {
              status: "Active",
            },
          },
          chapter: true,
        },
      },
      chapter: {
        select: {
          _count: {
            select: {
              lessons: true,
            },
          },
        },
      },
    },
  });

  // Transform to include calculated stats
  const data = courses.map((course) => {
    const totalLessons = course.chapter.reduce(
      (sum, chapter) => sum + chapter._count.lessons,
      0
    );

    return {
      id: course.id,
      title: course.title,
      smallDescription: course.smallDescription,
      duration: course.duration,
      level: course.level,
      status: course.status,
      price: course.price,
      fileKey: course.fileKey,
      slug: course.slug,
      createdAt: course.createdAt,
      category: course.category,
      enrollmentCount: course._count.enrollment,
      chapterCount: course._count.chapter,
      lessonCount: totalLessons,
    };
  });

  return data;
}

export type AdminCourseType = Awaited<ReturnType<typeof adminGetCourses>>[0];
