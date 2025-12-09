import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { z } from "zod";
import { getBrevoClient, SendSmtpEmail } from "@/lib/brevo";
import { invitationEmailTemplate } from "@/lib/email-templates";
import { env } from "@/lib/env";

const inviteSchema = z.object({
  email: z.string(), // Can be email or username (starting with @)
  role: z.enum(["Member", "Admin", "SuperAdmin"]),
  workspaceId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const session = await requireSuperAdmin();
    const body = await req.json();

    const validation = inviteSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    const { email: emailOrUsername, role, workspaceId } = validation.data;

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

    // Handle username (starting with @) or email
    let user;
    let email: string;
    
    if (emailOrUsername.startsWith("@")) {
      const username = emailOrUsername.slice(1);
      user = await prisma.user.findUnique({
        where: { username },
      });
      if (!user) {
        return NextResponse.json(
          { error: "User with this username not found" },
          { status: 404 }
        );
      }
      email = user.email;
    } else if (emailOrUsername.includes("@")) {
      email = emailOrUsername.toLowerCase();
      user = await prisma.user.findUnique({
        where: { email },
      });
    } else {
      return NextResponse.json(
        { error: "Please provide a valid email address or username (starting with @)" },
        { status: 400 }
      );
    }

    // Check if user already has this role in this workspace
    if (user) {
      const existingMembership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
      });

      if (existingMembership && existingMembership.role === role) {
        return NextResponse.json(
          { error: "User already has this role in this workspace" },
          { status: 400 }
        );
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: email,
        workspaceId,
        status: "Pending",
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Get inviter details for email
    const inviter = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        token,
        email: email,
        userId: user?.id,
        workspaceId,
        role,
        invitedBy: session.user.id,
        expiresAt,
        status: "Pending",
      },
    });

    // Generate invitation link
    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/accept?token=${token}`;

    // Send invitation email
    if (!env.BREVO_API_KEY) {
      console.log(`[DEV] Invitation link for ${email}: ${invitationLink}`);
      return NextResponse.json({
        message: "Invitation created successfully (email not sent - check console in dev mode)",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          link: invitationLink,
        },
      });
    }

    try {
      const brevoClient = getBrevoClient();
      const sendSmtpEmail = new SendSmtpEmail();

      const senderEmail = env.BREVO_SENDER_EMAIL;
      const senderName = env.BREVO_SENDER_NAME || "KnowledgeShare";

      if (!senderEmail) {
        throw new Error("BREVO_SENDER_EMAIL is required");
      }

      const inviterName = inviter
        ? `${inviter.firstName}${inviter.lastName ? ` ${inviter.lastName}` : ""}`
        : undefined;

      sendSmtpEmail.subject = `You've been invited to join KnowledgeShare as ${role}`;
      sendSmtpEmail.htmlContent = invitationEmailTemplate({
        invitationLink,
        role,
        inviterName,
      });
      sendSmtpEmail.sender = { name: senderName, email: senderEmail };
      sendSmtpEmail.to = [{ email: email }];

      await brevoClient.sendTransacEmail(sendSmtpEmail);

      return NextResponse.json({
        message: "Invitation sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          link: invitationLink,
        },
      });
    } catch (error: any) {
      console.error("Failed to send invitation email:", error);
      // Still return success since invitation was created, but log the error
      return NextResponse.json({
        message: "Invitation created but email sending failed. Please try resending.",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          link: invitationLink,
        },
        error: "Email sending failed",
      });
    }
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
