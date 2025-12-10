import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    // Payment statistics
    const totalPayments = await prisma.enrollment.count();
    const successfulPayments = await prisma.enrollment.count({
      where: {
        status: "Active",
      },
    });
    const failedPayments = await prisma.enrollment.count({
      where: {
        status: "Cancelled",
      },
    });
    const pendingPayments = await prisma.enrollment.count({
      where: {
        status: "Pending",
      },
    });

    // Refund statistics (if PaymentTransaction model exists)
    const refunds = await prisma.paymentTransaction.count({
      where: {
        refunded: true,
      },
    });

    const refundAmount = await prisma.paymentTransaction.aggregate({
      where: {
        refunded: true,
      },
      _sum: {
        refundAmount: true,
      },
    });

    // Best-selling courses
    const bestSelling = await prisma.course.findMany({
      where: {
        status: "Published",
      },
      include: {
        enrollment: {
          where: {
            status: "Active",
          },
          select: {
            id: true,
            amount: true,
          },
        },
      },
      orderBy: {
        enrollment: {
          _count: "desc",
        },
      },
      take: 10,
    });

    const bestSellingCourses = bestSelling.map((course) => ({
      courseId: course.id,
      courseTitle: course.title,
      sales: course.enrollment.length,
      revenue: course.enrollment.reduce((sum, e) => sum + e.amount, 0),
    }));

    return NextResponse.json({
      paymentStats: {
        total: totalPayments,
        successful: successfulPayments,
        failed: failedPayments,
        pending: pendingPayments,
        successRate:
          totalPayments > 0
            ? Math.round((successfulPayments / totalPayments) * 100)
            : 0,
      },
      refundStats: {
        totalRefunds: refunds,
        totalRefundAmount: refundAmount._sum.refundAmount || 0,
      },
      bestSellingCourses,
    });
  } catch (error) {
    console.error("Failed to fetch payment analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment analytics" },
      { status: 500 }
    );
  }
}
