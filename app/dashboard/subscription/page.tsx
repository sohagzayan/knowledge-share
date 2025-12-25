import { getUserSubscription } from "@/app/data/subscription/get-user-subscription";
import { SubscriptionDashboard } from "./_components/SubscriptionDashboard";
import { redirect } from "next/navigation";
import { requireUser } from "@/app/data/user/require-user";

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  await requireUser();
  const subscription = await getUserSubscription();

  return <SubscriptionDashboard subscription={subscription} />;
}

