import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { status: "error", message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    // Find verification record
    const verification = await prisma.verification.findUnique({
      where: {
        identifier: email,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { status: "error", message: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date() > verification.expiresAt) {
      await prisma.verification.delete({
        where: { identifier: email },
      });
      return NextResponse.json(
        { status: "error", message: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (verification.value !== otp) {
      return NextResponse.json(
        { status: "error", message: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      const firstName = email.split("@")[0];
      user = await prisma.user.create({
        data: {
          id: randomUUID(),
          email,
          firstName,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } else {
      // Update email verified status
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    // Delete used verification code
    await prisma.verification.delete({
      where: { identifier: email },
    });

    // Return success - the client will handle NextAuth signIn
    return NextResponse.json({
      status: "success",
      message: "OTP verified successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.firstName,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
