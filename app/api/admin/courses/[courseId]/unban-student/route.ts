import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const unbanStudentSchema = z.object({
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
    const result = unbanStudentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      );
    }

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: result.data.userId,
          courseId: courseId,
        },
      },
      data: {
        banned: false,
        banType: null,
        banUntil: null,
        banReason: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to unban student:", error);
    return NextResponse.json(
      { error: "Failed to unban student" },
      { status: 500 }
    );
  }
}

