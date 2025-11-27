import { requireAdmin } from "@/app/data/admin/require-admin";

export default async function WithdrawalsPage() {
  await requireAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
        <p className="text-muted-foreground">
          Manage and track withdrawal requests from instructors.
        </p>
      </div>

      <div className="rounded-3xl border border-border/60 bg-background shadow-lg shadow-black/5 p-6">
        <p className="text-muted-foreground">Withdrawals content will be displayed here.</p>
      </div>
    </div>
  );
}

