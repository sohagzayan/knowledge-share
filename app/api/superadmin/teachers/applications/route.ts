import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await requireSuperAdmin();

    const applications = await prisma.teacherApplication.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            bio: true,
            designation: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error("Failed to fetch teacher applications:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      digest: error?.digest,
      name: error?.name,
    });
    
    // Handle redirect errors (from requireSuperAdmin)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      return NextResponse.json(
        { error: "Unauthorized. Super admin access required." },
        { status: 403 }
      );
    }

    // Return more detailed error information in development
    const errorMessage = process.env.NODE_ENV === "development" 
      ? error?.message || error?.toString() || "Failed to fetch teacher applications"
      : "Failed to fetch teacher applications";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { applicationData } = body;

    // Check if application already exists
    const existing = await prisma.teacherApplication.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Application already submitted" },
        { status: 400 }
      );
    }

    const application = await prisma.teacherApplication.create({
      data: {
        userId: session.user.id,
        applicationData,
        status: "Pending",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Failed to create teacher application:", error);
    return NextResponse.json(
      { error: "Failed to create teacher application" },
      { status: 500 }
    );
  }
}
