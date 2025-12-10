import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { z } from "zod";
import { tiptapJsonToHtml, isTipTapJson } from "@/lib/tiptap-utils";

const updateAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  body: z.string().min(1, "Body is required").optional(),
  targetRole: z.enum(["AllStudents", "AllTeachers", "AllUsers", "SpecificStudents", "SpecificTeachers", "CourseStudents"]).optional(),
  targetCourseId: z.string().optional().nullable(),
  targetUserIds: z.array(z.string()).optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  isUrgent: z.boolean().optional(),
  attachmentKeys: z.array(z.string()).optional(),
  status: z.enum(["Draft", "Scheduled", "Published", "Expired"]).optional(),
});

// GET /api/announcements/[id] - Get single announcement
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.id;
    const userRole = (session.user as any).role;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        targetCourse: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        readStatuses: {
          where: {
            userId,
          },
          select: {
            readAt: true,
          },
        },
        _count: {
          select: {
            readStatuses: true,
          },
        },
      },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Check permissions
    if (userRole !== "superadmin" && userRole !== "admin") {
      // Student: check if they have access
      if (announcement.status !== "Published") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (userRole === "admin" && announcement.createdById !== userId) {
      // Admin can only view their own announcements
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      ...announcement,
      isRead: announcement.readStatuses.length > 0,
      readAt: announcement.readStatuses[0]?.readAt || null,
    });
  } catch (error) {
    console.error("Failed to fetch announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
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

    // Check if announcement exists and user has permission
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Admin can only edit their own announcements
    if (userRole === "admin" && existing.createdById !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateAnnouncementSchema.parse(body);

    // Admin restrictions
    if (userRole === "admin") {
      if (validatedData.targetRole === "AllTeachers" || validatedData.targetRole === "AllUsers") {
        return NextResponse.json(
          { error: "Admins cannot target teachers or all users" },
          { status: 403 }
        );
      }
      if (validatedData.targetRole === "SpecificTeachers") {
        return NextResponse.json(
          { error: "Admins cannot target specific teachers" },
          { status: 403 }
        );
      }
    }

    // Update publishedAt if status changes to Published
    let publishedAt = existing.publishedAt;
    if (validatedData.status === "Published" && !publishedAt) {
      publishedAt = new Date();
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        ...validatedData,
        publishedAt,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
        targetCourse: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Failed to update announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
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

    // Check if announcement exists and user has permission
    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Superadmin can delete any, admin can only delete their own
    if (userRole === "admin" && existing.createdById !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
