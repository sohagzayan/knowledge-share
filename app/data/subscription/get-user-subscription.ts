import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function getUserSubscription() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: session.user.id,
      status: {
        in: ["Active", "Trial"],
      },
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return subscription;
}

export type UserSubscriptionType = Awaited<
  ReturnType<typeof getUserSubscription>
>;

