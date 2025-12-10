import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import arcjet, { createMiddleware, detectBot } from "@arcjet/next";

// Configure Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY!, // Get your site key from https://app.arcjet.com
  rules: [
    detectBot({
      mode: "LIVE", // will block requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        "CATEGORY:MONITOR",
        "CATEGORY:PREVIEW",
        "STRIPE_WEBHOOK",

        // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
  ],
});

// Your existing authentication middleware
async function authMiddleware(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets and API routes (API routes handle their own auth)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};

// Combine Arcjet with your existing middleware
export default createMiddleware(aj, async (request: NextRequest) => {
  // Skip Arcjet protection for API routes (they handle their own authentication)
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Only apply auth middleware to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return authMiddleware(request);
  }

  // For non-admin routes, just continue
  return NextResponse.next();
});
