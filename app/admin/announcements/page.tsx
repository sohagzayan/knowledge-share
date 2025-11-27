import { requireAdmin } from "@/app/data/admin/require-admin";

export default async function AnnouncementsPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">
          Create and manage platform-wide announcements for all users.
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-background shadow-lg shadow-black/5 p-6">
        <p className="text-muted-foreground">Announcements content will be displayed here.</p>
      </div>
    </div>
  );
}

