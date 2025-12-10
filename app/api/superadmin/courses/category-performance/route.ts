import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    const categories = await prisma.course.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
      where: {
        status: "Published",
      },
    });

    const categoryPerformance = await Promise.all(
      categories.map(async (cat) => {
        const courses = await prisma.course.findMany({
          where: {
            category: cat.category,
            status: "Published",
          },
          include: {
            enrollment: {
              select: {
                id: true,
                amount: true,
              },
            },
            ratings: {
              select: {
                rating: true,
              },
            },
          },
        });

        const totalEnrollments = courses.reduce(
          (sum, c) => sum + c.enrollment.length,
          0
        );
        const totalRevenue = courses.reduce(
          (sum, c) => sum + c.enrollment.reduce((eSum, e) => eSum + e.amount, 0),
          0
        );
        const allRatings = courses.flatMap((c) => c.ratings);
        const avgRating =
          allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
            : 0;

        return {
          category: cat.category,
          courseCount: cat._count.id,
          totalEnrollments,
          totalRevenue,
          avgRating: Math.round(avgRating * 10) / 10,
        };
      })
    );

    // Sort by total enrollments
    categoryPerformance.sort((a, b) => b.totalEnrollments - a.totalEnrollments);

    return NextResponse.json(categoryPerformance);
  } catch (error) {
    console.error("Failed to fetch category performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch category performance" },
      { status: 500 }
    );
  }
}
