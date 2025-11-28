import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const banStudentSchema = z.object({
  userId: z.string().uuid(),
  banType: z.enum(["Temporary", "Permanent"]),
  banUntil: z.string().datetime().nullable().optional(),
  banReason: z.string().optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await requireAdmin();
    const { courseId } = await params;
    const body = await request.json();
    const result = banStudentSchema.safeParse(body);

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
        banned: true,
        banType: result.data.banType,
        banUntil: result.data.banUntil ? new Date(result.data.banUntil) : null,
        banReason: result.data.banReason || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to ban student:", error);
    return NextResponse.json(
      { error: "Failed to ban student" },
      { status: 500 }
    );
  }
}

