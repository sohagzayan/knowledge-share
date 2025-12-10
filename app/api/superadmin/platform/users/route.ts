import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status"); // active, suspended, pending

    const where: any = {};
    if (role) {
      where.role = role;
    } else {
      // Default: exclude superadmin from list unless specifically requested
      where.role = {
        not: "superadmin",
      };
    }

    if (status === "suspended") {
      where.banned = true;
    } else if (status === "active") {
      where.banned = {
        not: true,
      };
    } else if (status === "pending") {
      // Pending teachers (users with pending teacher applications)
      const pendingApps = await prisma.teacherApplication.findMany({
        where: {
          status: "Pending",
        },
        select: {
          userId: true,
        },
      });
      where.id = {
        in: pendingApps.map((app) => app.userId),
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        courses: {
          select: {
            id: true,
          },
        },
        enrollment: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
