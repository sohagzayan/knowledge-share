import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";
import { z } from "zod";

const removeSchema = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid(),
});

export async function DELETE(req: Request) {
  try {
    const session = await requireSuperAdmin();
    const body = await req.json();

    const validation = removeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { userId, workspaceId } = validation.data;

    // Prevent users from removing themselves
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot remove yourself from superadmins" },
        { status: 400 }
      );
    }

    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    // Find the membership
    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    if (membership.role !== "SuperAdmin") {
      return NextResponse.json(
        { error: "User is not a superadmin" },
        { status: 400 }
      );
    }

    // Delete the membership (this removes the superadmin role)
    await prisma.membership.delete({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    return NextResponse.json({
      message: "Superadmin removed successfully",
    });
  } catch (error) {
    console.error("Error removing superadmin:", error);
    return NextResponse.json(
      { error: "Failed to remove superadmin" },
      { status: 500 }
    );
  }
}
