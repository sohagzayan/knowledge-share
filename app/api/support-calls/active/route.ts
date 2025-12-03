import { NextRequest, NextResponse } from "next/server";
import { getActiveSupportCallsByCourse } from "@/app/data/course/support-calls";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    const activeSessions = await getActiveSupportCallsByCourse(courseId);

    return NextResponse.json(activeSessions);
  } catch (error) {
    console.error("Error fetching active support calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch active support calls" },
      { status: 500 }
    );
  }
}

