import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await requireAdmin();
    const { courseId } = await params;

    // Get enrollment count
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        courseId: courseId,
        status: "Active",
      },
    });

    // Get first 5 students for preview
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        status: "Active",
      },
      select: {
        id: true,
        createdAt: true,
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const students = enrollments.map((enrollment) => ({
      id: enrollment.User.id,
      firstName: enrollment.User.firstName,
      lastName: enrollment.User.lastName,
      email: enrollment.User.email,
      image: enrollment.User.image,
      username: enrollment.User.username,
      enrolledAt: enrollment.createdAt,
    }));

    return NextResponse.json({
      totalCount: enrollmentCount,
      students,
    });
  } catch (error) {
    console.error("Failed to fetch students preview:", error);
    return NextResponse.json(
      { error: "Failed to fetch students preview" },
      { status: 500 }
    );
  }
}