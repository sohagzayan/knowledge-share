import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";

export async function GET() {
  try {
    await requireSuperAdmin();

    // Most searched topics
    const searchQueries = await prisma.searchAnalytics.groupBy({
      by: ["query"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 20,
    });

    const mostSearched = searchQueries.map((q) => ({
      query: q.query,
      count: q._count.id,
    }));

    // Searches with zero results
    const zeroResultSearches = await prisma.searchAnalytics.findMany({
      where: {
        resultsCount: 0,
      },
      select: {
        query: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Group zero-result searches by query
    const zeroResultMap = new Map<string, number>();
    zeroResultSearches.forEach((search) => {
      const count = zeroResultMap.get(search.query) || 0;
      zeroResultMap.set(search.query, count + 1);
    });

    const zeroResultQueries = Array.from(zeroResultMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json({
      mostSearchedTopics: mostSearched,
      zeroResultSearches: zeroResultQueries,
    });
  } catch (error) {
    console.error("Failed to fetch search analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch search analytics" },
      { status: 500 }
    );
  }
}
