import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/announcements/[id]/read - Mark announcement as read
export async function POST(
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

    // Check if announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Check if already read
    const existingRead = await prisma.announcementReadStatus.findUnique({
      where: {
        userId_announcementId: {
          userId,
          announcementId: id,
        },
      },
    });

    if (existingRead) {
      return NextResponse.json({ success: true, alreadyRead: true });
    }

    // Mark as read
    await prisma.announcementReadStatus.create({
      data: {
        userId,
        announcementId: id,
      },
    });

    // Increment view count
    await prisma.announcement.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark announcement as read:", error);
    return NextResponse.json(
      { error: "Failed to mark announcement as read" },
      { status: 500 }
    );
  }
}
