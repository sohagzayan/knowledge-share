"use server";

import { requireSuperAdmin } from "@/app/data/admin/require-superadmin";
import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { AnnouncementsPageClient } from "./_components/AnnouncementsPageClient";

export default async function SuperAdminAnnouncementsPage() {
  await requireSuperAdmin();
  const courses = await adminGetCourses();

  const coursesForSelect = courses.map((course) => ({
    id: course.id,
    title: course.title,
  }));

  return (
    <AnnouncementsPageClient
      courses={coursesForSelect}
    />
  );
}
