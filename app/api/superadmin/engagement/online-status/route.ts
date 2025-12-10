import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    // Get active online sessions (last 5 minutes)
    const onlineSessions = await prisma.onlineSession.findMany({
      where: {
        lastActivityAt: {
          gte: fiveMinutesAgo,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        lastActivityAt: "desc",
      },
    });

    // Get unique online users
    const onlineUserIds = new Set(onlineSessions.map((s) => s.userId));
    const onlineUsers = Array.from(onlineUserIds).map((userId) => {
      const session = onlineSessions.find((s) => s.userId === userId);
      return session?.user;
    }).filter(Boolean);

    // Count by role
    const studentsOnline = onlineUsers.filter(
      (u) => !u?.role || u.role === "user"
    ).length;
    const teachersOnline = onlineUsers.filter(
      (u) => u?.role === "admin"
    ).length;
    const adminsOnline = onlineUsers.filter(
      (u) => u?.role === "superadmin"
    ).length;

    return NextResponse.json({
      totalOnline: onlineUserIds.size,
      studentsOnline,
      teachersOnline,
      adminsOnline,
      onlineUsers: onlineUsers.slice(0, 50), // Limit to 50 for performance
    });
  } catch (error) {
    console.error("Failed to fetch online status:", error);
    return NextResponse.json(
      { error: "Failed to fetch online status" },
      { status: 500 }
    );
  }
}
