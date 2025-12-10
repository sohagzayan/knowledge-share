import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month"; // today, week, month

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Total revenue for period
    const revenue = await prisma.enrollment.aggregate({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: "Active",
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Revenue by course
    const revenueByCourse = await prisma.course.findMany({
      where: {
        enrollment: {
          some: {
            createdAt: {
              gte: startDate,
            },
            status: "Active",
          },
        },
      },
      include: {
        enrollment: {
          where: {
            createdAt: {
              gte: startDate,
            },
            status: "Active",
          },
          select: {
            amount: true,
          },
        },
      },
    });

    const courseRevenue = revenueByCourse
      .map((course) => ({
        courseId: course.id,
        courseTitle: course.title,
        revenue: course.enrollment.reduce((sum, e) => sum + e.amount, 0),
        enrollments: course.enrollment.length,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by teacher
    const teachers = await prisma.user.findMany({
      where: {
        courses: {
          some: {
            enrollment: {
              some: {
                createdAt: {
                  gte: startDate,
                },
                status: "Active",
              },
            },
          },
        },
      },
      include: {
        courses: {
          include: {
            enrollment: {
              where: {
                createdAt: {
                  gte: startDate,
                },
                status: "Active",
              },
              select: {
                amount: true,
              },
            },
          },
        },
      },
    });

    const teacherRevenue = teachers
      .map((teacher) => ({
        teacherId: teacher.id,
        teacherName: `${teacher.firstName} ${teacher.lastName || ""}`.trim(),
        revenue: teacher.courses.reduce(
          (sum, course) =>
            sum + course.enrollment.reduce((eSum, e) => eSum + e.amount, 0),
          0
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by category
    const categoryRevenue = await prisma.course.groupBy({
      by: ["category"],
      where: {
        enrollment: {
          some: {
            createdAt: {
              gte: startDate,
            },
            status: "Active",
          },
        },
      },
    });

    const categoryRev = await Promise.all(
      categoryRevenue.map(async (cat) => {
        const courses = await prisma.course.findMany({
          where: {
            category: cat.category,
            enrollment: {
              some: {
                createdAt: {
                  gte: startDate,
                },
                status: "Active",
              },
            },
          },
          include: {
            enrollment: {
              where: {
                createdAt: {
                  gte: startDate,
                },
                status: "Active",
              },
              select: {
                amount: true,
              },
            },
          },
        });

        return {
          category: cat.category,
          revenue: courses.reduce(
            (sum, c) => sum + c.enrollment.reduce((eSum, e) => eSum + e.amount, 0),
            0
          ),
        };
      })
    );

    categoryRev.sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      totalRevenue: revenue._sum.amount || 0,
      totalOrders: revenue._count.id || 0,
      revenueByCourse: courseRevenue,
      revenueByTeacher: teacherRevenue,
      revenueByCategory: categoryRev,
    });
  } catch (error) {
    console.error("Failed to fetch revenue analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}
