"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { AnalyticsPageClient } from "./_components/AnalyticsPageClient";
import { adminGetEnrollmentStats } from "@/app/data/admin/admin-get-enrollment-stats";
import { adminGetDashboardStats } from "@/app/data/admin/admin-get-dashboard-stats";

export default async function AnalyticsPage() {
  await requireAdmin();
  const enrollmentData = await adminGetEnrollmentStats();
  const dashboardStats = await adminGetDashboardStats();

  return (
    <AnalyticsPageClient
      enrollmentData={enrollmentData}
      dashboardStats={dashboardStats}
    />
  );
}

