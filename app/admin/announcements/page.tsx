"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { adminGetCourses } from "@/app/data/admin/admin-get-courses";
import { adminGetAnnouncements } from "@/app/data/admin/admin-get-announcements";
import { AnnouncementsPageClient } from "./_components/AnnouncementsPageClient";

export default async function AnnouncementsPage() {
  await requireAdmin();
  const [courses, announcements] = await Promise.all([
    adminGetCourses(),
    adminGetAnnouncements(),
  ]);

  const coursesForSelect = courses.map((course) => ({
    id: course.id,
    title: course.title,
  }));

  return (
    <AnnouncementsPageClient
      initialAnnouncements={announcements}
      courses={coursesForSelect}
    />
  );
}

