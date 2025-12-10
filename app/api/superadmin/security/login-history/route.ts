import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const success = searchParams.get("success");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: any = {};
    if (userId) where.userId = userId;
    if (success !== null) where.success = success === "true";

    const loginHistory = await prisma.loginHistory.findMany({
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

    // Suspicious activity detection
    const suspiciousActivity = await prisma.loginHistory.groupBy({
      by: ["userId", "ipAddress"],
      where: {
        success: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 5, // More than 5 failed attempts
          },
        },
      },
    });

    return NextResponse.json({
      loginHistory,
      suspiciousActivity: suspiciousActivity.map((s) => ({
        userId: s.userId,
        ipAddress: s.ipAddress,
        failedAttempts: s._count.id,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch login history:", error);
    return NextResponse.json(
      { error: "Failed to fetch login history" },
      { status: 500 }
    );
  }
}
