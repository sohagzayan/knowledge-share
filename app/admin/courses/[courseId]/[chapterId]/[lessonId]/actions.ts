"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";

export async function updateLesson(
  values: LessonSchemaType,
  lessonId: string
): Promise<ApiResponse> {
  await requireAdmin();

  try {
    const result = lessonSchema.safeParse(values);

    if (!result.success) {
      return {
        status: "error",
        message: "Invalid data",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.lesson.update({
        where: {
          id: lessonId,
        },
        data: {
          title: result.data.name,
          description: result.data.description,
          thumbnailKey: result.data.thumbnailKey,
          videoKey: result.data.videoKey,
          status: result.data.status ?? "Draft",
          releaseAt: result.data.releaseAt
            ? new Date(result.data.releaseAt)
            : null,
        },
      });

      // Handle assignment
      if (result.data.assignment?.title) {
        await tx.assignment.upsert({
          where: {
            lessonId: lessonId,
          },
          create: {
            title: result.data.assignment.title,
            description: result.data.assignment.description ?? null,
            fileKey: result.data.assignment.fileKey ?? null,
            points: result.data.assignment.points ?? 100,
            dueDate: result.data.assignment.dueDate
              ? new Date(result.data.assignment.dueDate)
              : null,
            lessonId: lessonId,
          },
          update: {
            title: result.data.assignment.title,
            description: result.data.assignment.description ?? null,
            fileKey: result.data.assignment.fileKey ?? null,
            points: result.data.assignment.points ?? 100,
            dueDate: result.data.assignment.dueDate
              ? new Date(result.data.assignment.dueDate)
              : null,
          },
        });
      } else {
        // Delete assignment if title is not provided
        await tx.assignment.deleteMany({
          where: {
            lessonId: lessonId,
          },
        });
      }
    });

    return {
      status: "success",
      message: "Course updated successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to update course",
    };
  }
}
