import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Lightweight authentication middleware
async function authMiddleware(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // If auth check fails, allow the request to continue (fail open for non-admin routes)
    // Admin routes will be protected by their own layout/page-level auth
    return NextResponse.next();
  }
}

export const config = {
  // Run on all routes except static assets and API routes (API routes handle their own auth)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

// Main middleware function
export default async function middleware(request: NextRequest) {
  // Skip middleware for API routes (they handle their own authentication)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Apply Arcjet protection if available (optional)
  if (process.env.ARCJET_KEY) {
    try {
      const { default: arcjet, detectBot } = await import("@arcjet/next");
      
      const aj = arcjet({
        key: process.env.ARCJET_KEY,
        rules: [
          detectBot({
            mode: "LIVE",
            allow: [
              "CATEGORY:SEARCH_ENGINE",
              "CATEGORY:MONITOR",
              "CATEGORY:PREVIEW",
              "STRIPE_WEBHOOK",
            ],
          }),
        ],
      });

      // Run Arcjet protection
      const arcjetResult = await aj.protect(request);
      
      // If Arcjet blocked the request, return forbidden
      if (arcjetResult.isDenied()) {
        return new NextResponse("Forbidden", { status: 403 });
      }
    } catch (error) {
      // If Arcjet fails, log and continue (don't block the request)
      console.warn("Arcjet protection error, continuing without protection:", error);
    }
  }

  // Only apply auth middleware to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(request);
  }

  // For all other routes (including /courses and /dashboard), allow access
  // They will handle their own authentication at the page/layout level
  return NextResponse.next();
}
