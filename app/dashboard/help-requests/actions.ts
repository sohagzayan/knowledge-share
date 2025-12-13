"use server";

import { requireUser } from "@/app/data/user/require-user";
import { ApiResponse } from "@/lib/types";
import { prisma } from "@/lib/db";
import { z } from "zod";
import arcjet, { fixedWindow } from "@/lib/arcjet";
import { request } from "@arcjet/next";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 5,
  })
);

const replySchema = z.object({
  requestId: z.string().uuid(),
  reply: z.string().min(10, "Reply must be at least 10 characters").max(5000, "Reply must be at most 5000 characters"),
});

export async function submitUserReply(
  data: z.infer<typeof replySchema>
): Promise<ApiResponse> {
  const user = await requireUser();
  
  try {
    const req = await request();
    const decision = await aj.protect(req, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return {
        status: "error",
        message: "Too many requests. Please wait a moment before replying again.",
      };
    }

    const validation = replySchema.safeParse(data);
    if (!validation.success) {
      return {
        status: "error",
        message: validation.error.errors[0]?.message || "Invalid reply data",
      };
    }

    // Verify the help request belongs to the user
    const helpRequest = await prisma.helpRequest.findUnique({
      where: {
        id: validation.data.requestId,
      },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!helpRequest) {
      return {
        status: "error",
        message: "Help request not found",
      };
    }

    if (helpRequest.userId !== user.id) {
      return {
        status: "error",
        message: "You don't have permission to reply to this request",
      };
    }

    // Update the help request with user reply
    await prisma.helpRequest.update({
      where: {
        id: validation.data.requestId,
      },
      data: {
        userReply: validation.data.reply,
        userRepliedAt: new Date(),
        status: helpRequest.status === "Resolved" ? "InProgress" : helpRequest.status, // Reopen if resolved
      },
    });

    return {
      status: "success",
      message: "Your reply has been sent successfully. The support team will review it soon.",
    };
  } catch (error) {
    console.error("Error submitting user reply:", error);
    return {
      status: "error",
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}
