import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { z } from "zod";
import { tiptapJsonToHtml, isTipTapJson } from "@/lib/tiptap-utils";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  targetRole: z.enum(["AllStudents", "AllTeachers", "AllUsers", "SpecificStudents", "SpecificTeachers", "CourseStudents"]),
  targetCourseId: z.string().optional().nullable(),
  targetUserIds: z.array(z.string()).optional().default([]),
  scheduledAt: z.string().datetime().optional().nullable(),
  isUrgent: z.boolean().optional().default(false),
  attachmentKeys: z.array(z.string()).optional().default([]),
  publishNow: z.boolean().optional().default(true),
});

// GET /api/announcements - List announcements (role-based filtering)
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      console.error("GET /api/announcements: No session or user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = session.user.id;
    console.log("GET /api/announcements: User authenticated", { userId, userRole });

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const sortBy = searchParams.get("sortBy") || "DESC";

    // For admin/superadmin: show management view
    if (userRole === "admin" || userRole === "superadmin") {
      const where: any = userRole === "superadmin" ? {} : { createdById: userId };
      
      if (courseId && courseId !== "All") {
        where.targetCourseId = courseId;
      }

      console.log("GET /api/announcements: Fetching announcements for admin/superadmin", { where, sortBy });
      try {
        const announcements = await prisma.announcement.findMany({
          where,
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
            _count: {
              select: {
                readStatuses: true,
              },
            },
          },
          orderBy: sortBy === "ASC" 
            ? { createdAt: "asc" }
            : { createdAt: "desc" },
        });

        console.log("GET /api/announcements: Successfully fetched", announcements.length, "announcements");
        return NextResponse.json(announcements);
      } catch (dbError) {
        console.error("GET /api/announcements: Database error", dbError);
        throw dbError;
      }
    }

    // For students: show feed view
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        status: "Active",
      },
      select: {
        courseId: true,
      },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    const conditions = [];

    conditions.push({
      targetRole: "AllStudents",
      status: "Published",
      OR: [
        { publishedAt: { lte: new Date() } },
        { publishedAt: null },
      ],
    });

    conditions.push({
      targetRole: "AllUsers",
      status: "Published",
      OR: [
        { publishedAt: { lte: new Date() } },
        { publishedAt: null },
      ],
    });

    if (enrolledCourseIds.length > 0) {
      conditions.push({
        targetRole: "CourseStudents",
        targetCourseId: { in: enrolledCourseIds },
        status: "Published",
        OR: [
          { publishedAt: { lte: new Date() } },
          { publishedAt: null },
        ],
      });
    }

    conditions.push({
      targetRole: "SpecificStudents",
      targetUserIds: { has: userId },
      status: "Published",
      OR: [
        { publishedAt: { lte: new Date() } },
        { publishedAt: null },
      ],
    });

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: conditions,
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
        readStatuses: {
          where: {
            userId,
          },
          select: {
            readAt: true,
          },
        },
      },
      orderBy: [
        { isUrgent: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });

    const announcementsWithReadStatus = announcements.map((announcement) => ({
      ...announcement,
      isRead: announcement.readStatuses.length > 0,
      readAt: announcement.readStatuses[0]?.readAt || null,
    }));

    return NextResponse.json(announcementsWithReadStatus);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error("Error details:", errorDetails);
    return NextResponse.json(
      { 
        error: "Failed to fetch announcements",
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userId = session.user.id;

    const body = await request.json();
    const validatedData = createAnnouncementSchema.parse(body);

    // Admin restrictions: cannot target teachers or all users
    if (userRole === "admin" && (validatedData.targetRole === "AllTeachers" || validatedData.targetRole === "AllUsers")) {
      return NextResponse.json(
        { error: "Admins cannot create announcements for teachers or all users" },
        { status: 403 }
      );
    }

    // Admin restrictions: cannot target specific teachers
    if (userRole === "admin" && validatedData.targetRole === "SpecificTeachers") {
      return NextResponse.json(
        { error: "Admins cannot target specific teachers" },
        { status: 403 }
      );
    }

    // If targeting course students, courseId is required
    if (validatedData.targetRole === "CourseStudents" && !validatedData.targetCourseId) {
      return NextResponse.json(
        { error: "Course ID is required when targeting course students" },
        { status: 400 }
      );
    }

    // Convert TipTap JSON to HTML if needed
    let bodyHtml = validatedData.body;
    if (typeof validatedData.body === 'string' && isTipTapJson(validatedData.body)) {
      bodyHtml = tiptapJsonToHtml(validatedData.body);
    }

    // Determine status and publishedAt
    let status: "Draft" | "Scheduled" | "Published" = "Draft";
    let publishedAt: Date | null = null;

    if (validatedData.publishNow) {
      status = "Published";
      publishedAt = new Date();
    } else if (validatedData.scheduledAt) {
      status = "Scheduled";
      publishedAt = new Date(validatedData.scheduledAt);
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: validatedData.title,
        body: bodyHtml,
        createdById: userId,
        targetRole: validatedData.targetRole,
        targetCourseId: validatedData.targetCourseId || null,
        targetUserIds: validatedData.targetUserIds || [],
        scheduledAt: validatedData.scheduledAt ? new Date(validatedData.scheduledAt) : null,
        publishedAt,
        status,
        isUrgent: validatedData.isUrgent || false,
        attachmentKeys: validatedData.attachmentKeys || [],
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

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Failed to create announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}
