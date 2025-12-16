import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBrevoClient, SendSmtpEmail } from "@/lib/brevo";
import { otpEmailTemplate } from "@/lib/email-templates";
import { env } from "@/lib/env";
import { randomInt, randomUUID } from "crypto";
import bcrypt from "bcryptjs";

// Force Node.js runtime (required for Prisma and bcrypt)
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrUsername, password, email } = body;

    // If email is provided directly (for resend), allow resending without password
    // if there's already a verification record (password was already verified)
    if (email && typeof email === "string") {
      const existingVerification = await prisma.verification.findUnique({
        where: { identifier: email.toLowerCase().trim() },
      });

      if (existingVerification && new Date() < existingVerification.expiresAt) {
        // Allow resending OTP without password if verification exists and not expired
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
          return NextResponse.json(
            { status: "error", message: "User not found" },
            { status: 404 }
          );
        }

        // Generate new OTP
        const otp = randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update OTP
        await prisma.verification.update({
          where: { identifier: email.toLowerCase().trim() },
          data: {
            value: otp,
            expiresAt,
            updatedAt: new Date(),
          },
        });

        // Send OTP email
        const brevoClient = getBrevoClient();
        const sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.subject = "Your Edupeak Login Code";
        sendSmtpEmail.htmlContent = otpEmailTemplate({ otp });
        sendSmtpEmail.sender = {
          name: env.BREVO_SENDER_NAME || "Edupeak",
          email: env.BREVO_SENDER_EMAIL || "sohag.zayan@gmail.com",
        };
        sendSmtpEmail.to = [{ email: email.toLowerCase().trim() }];

        try {
          await brevoClient.sendTransacEmail(sendSmtpEmail);
        } catch (emailError) {
          console.error("Brevo email error:", emailError);
          return NextResponse.json(
            {
              status: "error",
              message: "Failed to send email. Please try again later.",
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          status: "success",
          message: "Verification code sent to your email",
          email: email.toLowerCase().trim(),
        });
      }
    }

    if (!emailOrUsername || typeof emailOrUsername !== "string") {
      return NextResponse.json(
        { status: "error", message: "Email or username is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { status: "error", message: "Password is required" },
        { status: 400 }
      );
    }

    // Determine if input is email or username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(emailOrUsername.trim());

    // Find user by email or username
    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({
        where: { email: emailOrUsername.trim().toLowerCase() },
        include: {
          accounts: {
            where: {
              providerId: "credential",
            },
          },
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { username: emailOrUsername.trim().toLowerCase() },
        include: {
          accounts: {
            where: {
              providerId: "credential",
            },
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    // Find credential account with password
    const credentialAccount = user.accounts.find(
      (account) => account.providerId === "credential" && account.password
    );

    if (!credentialAccount || !credentialAccount.password) {
      return NextResponse.json(
        {
          status: "error",
          message: "Password-based login is not enabled for this account",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      credentialAccount.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "error", message: "Invalid email/username or password" },
        { status: 401 }
      );
    }

    // Get user's email for OTP
    const userEmail = user.email.toLowerCase().trim();

    // Generate 6-digit OTP
    const otp = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store or update OTP in Verification table
    await prisma.verification.upsert({
      where: {
        identifier: userEmail,
      },
      create: {
        id: randomUUID(),
        identifier: userEmail,
        value: otp,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        value: otp,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    // Send OTP email using Brevo
    const brevoClient = getBrevoClient();
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = "Your Edupeak Login Code";
    sendSmtpEmail.htmlContent = otpEmailTemplate({ otp });
    sendSmtpEmail.sender = {
      name: env.BREVO_SENDER_NAME || "Edupeak",
      email: env.BREVO_SENDER_EMAIL || "sohag.zayan@gmail.com",
    };
    sendSmtpEmail.to = [{ email: userEmail }];

    try {
      await brevoClient.sendTransacEmail(sendSmtpEmail);
    } catch (emailError) {
      console.error("Brevo email error:", emailError);
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to send email. Please try again later.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Verification code sent to your email",
      email: userEmail,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
