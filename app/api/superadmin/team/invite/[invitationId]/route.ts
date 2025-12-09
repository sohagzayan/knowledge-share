import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const session = await requireSuperAdmin();
    const { invitationId } = await params;

    if (!invitationId) {
      return NextResponse.json(
        { error: "Invitation ID is required" },
        { status: 400 }
      );
    }

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
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

    // Verify the invitation belongs to a workspace the user has access to
    // (In this case, we're using the default workspace, but you might want to add workspace verification)
    // For now, we'll just check if the user is a superadmin

    // Only allow canceling pending invitations
    if (invitation.status !== "Pending") {
      return NextResponse.json(
        { error: "Only pending invitations can be canceled" },
        { status: 400 }
      );
    }

    // Delete the invitation
    await prisma.invitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({
      message: "Invitation canceled successfully",
    });
  } catch (error) {
    console.error("Error canceling invitation:", error);
    return NextResponse.json(
      { error: "Failed to cancel invitation" },
      { status: 500 }
    );
  }
}
