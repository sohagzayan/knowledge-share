import { getSubscriptionPlans } from "@/app/data/subscription/get-subscription-plans";
import { PricingPlans } from "./_components/PricingPlans";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = await getSubscriptionPlans();

  return <PricingPlans plans={plans} />;
}
