import "server-only";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireAdmin = cache(async () => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  const userRole = (session.user as any).role;
  const hasSuperAdminMembership = (session.user as any).hasSuperAdminMembership;
  
  // Allow admin, superadmin role, or admin with SuperAdmin membership
  if (userRole !== "admin" && userRole !== "superadmin" && !hasSuperAdminMembership) {
    return redirect("/not-admin");
  }

  return session;
});
