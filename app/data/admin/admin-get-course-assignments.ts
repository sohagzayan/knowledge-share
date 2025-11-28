import "server-only";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";

export async function adminGetCourseAssignments(courseId: string) {
  await requireAdmin();

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      title: true,
      chapter: {
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            select: {
              id: true,
              title: true,
              position: true,
              assignment: {
                select: {
                  id: true,
                  title: true,
                  points: true,
                  submissions: {
                    select: {
                      id: true,
                      fileKey: true,
                      link: true,
                      description: true,
                      status: true,
                      grade: true,
                      feedback: true,
                      submittedAt: true,
                      submissionCount: true,
                      User: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                          image: true,
                          username: true,
                        },
                      },
                    },
                    orderBy: {
                      submittedAt: "desc",
                    },
                  },
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!course) {
    return null;
  }

  return course;
}

export type CourseAssignmentsType = Awaited<
  ReturnType<typeof adminGetCourseAssignments>
>;

