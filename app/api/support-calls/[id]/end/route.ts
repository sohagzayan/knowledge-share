import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { endSupportCall, getSupportCallByStreamId } from "@/app/data/course/support-calls";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // This is the streamCallId
    const supportCall = await getSupportCallByStreamId(id);
    
    if (!supportCall) {
      // Try by support call ID instead
      const { getSupportCallById } = await import("@/app/data/course/support-calls");
      const callById = await getSupportCallById(id);
      if (!callById) {
        return NextResponse.json(
          { error: "Support call not found" },
          { status: 404 }
        );
      }
      
      // Check if user is the creator or admin
      const userRole = (session.user as { role?: string }).role;
      if (callById.createdBy !== session.user.id && userRole !== "admin") {
        return NextResponse.json(
          { error: "Unauthorized to end this call" },
          { status: 403 }
        );
      }

      await endSupportCall(callById.id);
      return NextResponse.json({ success: true });
    }

    // Check if user is the creator or admin
    const userRole = (session.user as { role?: string }).role;
    if (supportCall.createdBy !== session.user.id && userRole !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized to end this call" },
        { status: 403 }
      );
    }

    await endSupportCall(supportCall.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error ending support call:", error);
    return NextResponse.json(
      { error: "Failed to end support call" },
      { status: 500 }
    );
  }
}

