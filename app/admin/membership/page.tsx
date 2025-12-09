import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { MembershipPageClient } from "./_components/MembershipPageClient";

export default async function MembershipPage() {
  const session = await requireAdmin();
  
  // Get user's memberships
  const memberships = await prisma.membership.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <MembershipPageClient memberships={memberships} />;
}
