import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendFollowUpEmail } from "@/lib/email-templates";

const sendFollowUpSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await requireAdmin();
    const { courseId } = await params;
    const body = await request.json();
    const result = sendFollowUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    // Get user and course info
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: result.data.userId,
          courseId: courseId,
        },
      },
      select: {
        User: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        Course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Send follow-up email (implement your email sending logic here)
    // await sendFollowUpEmail({
    //   to: enrollment.User.email,
    //   studentName: `${enrollment.User.firstName} ${enrollment.User.lastName}`,
    //   courseName: enrollment.Course.title,
    // });

    // Mark as sent
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: result.data.userId,
          courseId: courseId,
        },
      },
      data: {
        followUpEmailSent: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send follow-up email:", error);
    return NextResponse.json(
      { error: "Failed to send follow-up email" },
      { status: 500 }
    );
  }
}

