import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const errorType = searchParams.get("errorType");
    const statusCode = searchParams.get("statusCode");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (errorType) where.errorType = errorType;
    if (statusCode) where.statusCode = parseInt(statusCode);

    const errorLogs = await prisma.errorLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Error statistics
    const errorStats = await prisma.errorLog.groupBy({
      by: ["errorType", "statusCode"],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    const fourxx = errorStats
      .filter((e) => e.statusCode && e.statusCode >= 400 && e.statusCode < 500)
      .reduce((sum, e) => sum + e._count.id, 0);

    const fivexx = errorStats
      .filter((e) => e.statusCode && e.statusCode >= 500)
      .reduce((sum, e) => sum + e._count.id, 0);

    return NextResponse.json({
      errorLogs,
      statistics: {
        fourxx,
        fivexx,
        total: errorLogs.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch error logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch error logs" },
      { status: 500 }
    );
  }
}
