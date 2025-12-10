import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { auth } from "@/lib/auth";

// GET /api/announcements/[id]/analytics - Get analytics for an announcement
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const userRole = (session.user as any).role;

    // Check if announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Admin can only see analytics for their own announcements
    if (userRole === "admin" && announcement.createdById !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get read statuses with user info
    const readStatuses = await prisma.announcementReadStatus.findMany({
      where: {
        announcementId: id,
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
        readAt: "desc",
      },
    });

    // Calculate unique views
    const uniqueViews = readStatuses.length;
    const totalViews = announcement.viewCount;

    // Get target audience size
    let targetAudienceSize = 0;
    
    if (announcement.targetRole === "AllStudents") {
      targetAudienceSize = await prisma.user.count({
        where: {
          OR: [{ role: "user" }, { role: null }],
        },
      });
    } else if (announcement.targetRole === "AllTeachers") {
      targetAudienceSize = await prisma.user.count({
        where: {
          role: "admin",
        },
      });
    } else if (announcement.targetRole === "AllUsers") {
      targetAudienceSize = await prisma.user.count();
    } else if (announcement.targetRole === "CourseStudents" && announcement.targetCourseId) {
      targetAudienceSize = await prisma.enrollment.count({
        where: {
          courseId: announcement.targetCourseId,
          status: "Active",
        },
      });
    } else if (announcement.targetRole === "SpecificStudents" || announcement.targetRole === "SpecificTeachers") {
      targetAudienceSize = announcement.targetUserIds.length;
    }

    return NextResponse.json({
      announcement: {
        id: announcement.id,
        title: announcement.title,
        targetRole: announcement.targetRole,
        publishedAt: announcement.publishedAt,
      },
      metrics: {
        totalViews,
        uniqueViews,
        targetAudienceSize,
        readPercentage: targetAudienceSize > 0 
          ? Math.round((uniqueViews / targetAudienceSize) * 100) 
          : 0,
      },
      readers: readStatuses.map((rs) => ({
        user: rs.user,
        readAt: rs.readAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
