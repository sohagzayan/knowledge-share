import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";

export const requireSuperAdmin = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  const userRole = (session.user as { role?: string }).role;
  const hasSuperAdminMembership = (session.user as { hasSuperAdminMembership?: boolean }).hasSuperAdminMembership;

  // Allow if user role is superadmin OR if user has SuperAdmin membership
  if (userRole !== "superadmin" && !hasSuperAdminMembership) {
    // Double-check membership in database (in case session is stale)
    const membership = await prisma.membership.findFirst({
      where: {
        userId: session.user.id,
        role: "SuperAdmin",
      },
    });

    if (!membership) {
      return redirect("/not-admin");
    }
  }

  return session;
});
