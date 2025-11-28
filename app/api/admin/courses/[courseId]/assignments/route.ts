import { adminGetCourseAssignments } from "@/app/data/admin/admin-get-course-assignments";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const data = await adminGetCourseAssignments(courseId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch course assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch course assignments" },
      { status: 500 }
    );
  }
}

