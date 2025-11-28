"use server";

import { requireUser } from "@/app/data/user/require-user";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { assignmentSubmissionSchema, AssignmentSubmissionSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(
  lessonId: string,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();

  try {
    await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        lessonId: lessonId,
        userId: session.id,
        completed: true,
      },
    });

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: "Progress updated",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to mark lesson as complete",
    };
  }
}

export async function submitAssignment(
  values: AssignmentSubmissionSchemaType,
  slug: string
): Promise<ApiResponse> {
  const session = await requireUser();

  try {
    const result = assignmentSubmissionSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: result.error.errors[0]?.message ?? "Invalid submission data",
      };
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: result.data.assignmentId,
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      return {
        status: "error",
        message: "Assignment not found",
      };
    }

    // Check if submission already exists
    const existingSubmission = await prisma.assignmentSubmission.findUnique({
      where: {
        userId_assignmentId: {
          userId: session.id,
          assignmentId: result.data.assignmentId,
        },
      },
      select: {
        id: true,
        status: true,
        submissionCount: true,
      },
    });

    // If submission exists and status is "Graded", don't allow editing
    if (existingSubmission && existingSubmission.status === "Graded") {
      return {
        status: "error",
        message: "Cannot edit submission that has been graded. Please contact your instructor.",
      };
    }

    // Prepare data - convert empty strings to null
    const fileKey = result.data.fileKey && result.data.fileKey.trim() !== "" ? result.data.fileKey : null;
    const link = result.data.link && result.data.link.trim() !== "" ? result.data.link : null;
    const description = result.data.description && result.data.description.trim() !== "" ? result.data.description : null;

    // Create or update submission
    if (existingSubmission) {
      // Update existing submission
      await prisma.assignmentSubmission.update({
        where: {
          userId_assignmentId: {
            userId: session.id,
            assignmentId: result.data.assignmentId,
          },
        },
        data: {
          fileKey,
          link,
          description,
          status: "Pending",
          submittedAt: new Date(),
          submissionCount: existingSubmission.submissionCount + 1,
        },
      });
    } else {
      // Create new submission
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: result.data.assignmentId,
          userId: session.id,
          fileKey,
          link,
          description,
          status: "Pending",
          submissionCount: 1,
        },
      });
    }

    revalidatePath(`/dashboard/${slug}`);

    return {
      status: "success",
      message: existingSubmission ? "Assignment resubmitted successfully" : "Assignment submitted successfully",
    };
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    return {
      status: "error",
      message: "Failed to submit assignment. Please try again.",
    };
  }
}
