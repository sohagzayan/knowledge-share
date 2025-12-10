import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET(req: Request) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "day"; // day, week, month

    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    // Get watch analytics
    const watchData = await prisma.lessonWatchAnalytics.findMany({
      where: {
        lastWatchedAt: {
          gte: startDate,
        },
      },
      select: {
        watchDuration: true,
        totalDuration: true,
        lastWatchedAt: true,
      },
    });

    // Calculate total minutes viewed
    const totalMinutes = watchData.reduce(
      (sum, w) => sum + Math.round(w.watchDuration / 60),
      0
    );

    // Calculate average watch duration per lesson
    const avgWatchDuration =
      watchData.length > 0
        ? watchData.reduce((sum, w) => sum + w.watchDuration, 0) /
          watchData.length
        : 0;

    // Time-of-day learning heatmap (by hour)
    const hourlyData: { hour: number; minutes: number }[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startDate);
      hourStart.setHours(hour, 0, 0, 0);
      const hourEnd = new Date(startDate);
      hourEnd.setHours(hour, 59, 59, 999);

      const hourWatches = watchData.filter((w) => {
        const watchHour = new Date(w.lastWatchedAt).getHours();
        return watchHour === hour;
      });

      const hourMinutes = hourWatches.reduce(
        (sum, w) => sum + Math.round(w.watchDuration / 60),
        0
      );

      hourlyData.push({
        hour,
        minutes: hourMinutes,
      });
    }

    return NextResponse.json({
      totalMinutesViewed: totalMinutes,
      avgWatchDurationPerLesson: Math.round(avgWatchDuration),
      hourlyHeatmap: hourlyData,
    });
  } catch (error) {
    console.error("Failed to fetch learning time statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning time statistics" },
      { status: 500 }
    );
  }
}
