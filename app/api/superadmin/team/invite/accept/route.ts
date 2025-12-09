import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to accept an invitation" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = acceptSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { token } = validation.data;

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "Expired" },
      });
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if invitation is already accepted
    if (invitation.status === "Accepted") {
      return NextResponse.json(
        { error: "Invitation has already been accepted" },
        { status: 400 }
      );
    }

    // Verify email matches (if invitation has email)
    // For SuperAdmin invitations, allow acceptance by any logged-in user since
    // the token itself provides security and superadmins control these invitations.
    // For other roles, require email match for security.
    if (invitation.role !== "SuperAdmin" && invitation.email.toLowerCase() !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { 
          error: "This invitation is for a different email address",
          invitationEmail: invitation.email 
        },
        { status: 403 }
      );
    }

    // Check if user already has a membership in this workspace
    const existingMembership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
        },
      },
    });

    if (existingMembership) {
      // Update existing membership role
      await prisma.membership.update({
        where: {
          userId_workspaceId: {
            userId: session.user.id,
            workspaceId: invitation.workspaceId,
          },
        },
        data: {
          role: invitation.role,
        },
      });
    } else {
      // Create new membership
      await prisma.membership.create({
        data: {
          userId: session.user.id,
          workspaceId: invitation.workspaceId,
          role: invitation.role,
        },
      });
    }

    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "Accepted",
        acceptedAt: new Date(),
        userId: session.user.id,
      },
    });

    // If this is a SuperAdmin invitation, update the user's role to superadmin
    // This ensures they can access all superadmin features including dashboard
    if (invitation.role === "SuperAdmin") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          role: "superadmin",
        },
      });
    }

    return NextResponse.json({
      message: "Invitation accepted successfully",
      role: invitation.role,
      userRoleUpdated: invitation.role === "SuperAdmin",
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to accept invitation" },
      { status: 500 }
    );
  }
}
