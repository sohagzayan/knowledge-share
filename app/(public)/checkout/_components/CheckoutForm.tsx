"use client";

import { useState } from "react";
import { SubscriptionPlanType } from "@/app/data/subscription/get-subscription-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createSubscriptionCheckout } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CheckoutFormProps {
  plan: SubscriptionPlanType;
  billingCycle: "monthly" | "yearly";
}

export function CheckoutForm({ plan, billingCycle: initialBillingCycle }: CheckoutFormProps) {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(initialBillingCycle);
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const monthlyEquivalent = billingCycle === "yearly" ? Math.round(plan.priceYearly / 12) : plan.priceMonthly;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createSubscriptionCheckout({
        planId: plan.id,
        billingCycle,
        couponCode: couponCode || undefined,
      });

      if (result.status === "success" && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        toast.error(result.message || "Failed to create checkout session");
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>Review your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold">{plan.name}</h3>
            <p className="text-muted-foreground">{plan.description}</p>
          </div>

          <div className="space-y-2">
            <Label>Billing Cycle</Label>
            <Select
              value={billingCycle}
              onValueChange={(value) => setBillingCycle(value as "monthly" | "yearly")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">
                  <div className="flex items-center justify-between w-full">
                    <span>Monthly</span>
                    <span className="ml-4 font-semibold">${(plan.priceMonthly / 100).toFixed(0)}/month</span>
                  </div>
                </SelectItem>
                <SelectItem value="yearly">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <span>Yearly</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Save {Math.round((1 - plan.priceYearly / (plan.priceMonthly * 12)) * 100)}%)
                      </span>
                    </div>
                    <span className="ml-4 font-semibold">${(plan.priceYearly / 100).toFixed(0)}/year</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apply Coupon</CardTitle>
          <CardDescription>Have a discount code? Enter it here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <Button type="button" variant="outline">
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span>{plan.name} ({billingCycle === "yearly" ? "Yearly" : "Monthly"})</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${(price / 100).toFixed(2)}</span>
          </div>
          {couponCode && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount ({couponCode})</span>
              <span>-</span>
            </div>
          )}
          <div className="border-t pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span>${(price / 100).toFixed(2)}</span>
          </div>
          {billingCycle === "yearly" && (
            <p className="text-xs text-muted-foreground">
              ${(monthlyEquivalent / 100).toFixed(2)}/month billed annually
            </p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            Processing...
            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          `Complete Purchase - $${(price / 100).toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By completing your purchase, you agree to our Terms of Service and Privacy Policy.
        Your subscription will automatically renew unless cancelled.
      </p>
    </form>
  );
}

