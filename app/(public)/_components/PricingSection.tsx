"use client";

import Link from "next/link";
import { Check } from "lucide-react";

interface PricingPlan {
  name: string;
  description: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
  buttonVariant: "default" | "outline";
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: "$0",
    features: [
      "Access to 5 free courses",
      "Basic progress tracking",
      "Community support",
      "Certificate of completion",
      "Mobile app access",
    ],
    ctaText: "Start for free",
    ctaLink: "/register",
    buttonVariant: "outline",
  },
  {
    name: "Pro",
    description: "For serious learners",
    price: "$20",
    features: [
      "Unlimited course access",
      "Advanced progress tracking",
      "Priority support",
      "Downloadable resources",
      "Live Q&A sessions",
    ],
    ctaText: "Get started",
    ctaLink: "/register?plan=pro",
    popular: true,
    buttonVariant: "default",
  },
  {
    name: "Scale",
    description: "For teams & organizations",
    price: "$100",
    features: [
      "Everything in Pro",
      "Team management",
      "Custom learning paths",
      "Analytics dashboard",
      "Dedicated support",
    ],
    ctaText: "Get started",
    ctaLink: "/register?plan=scale",
    buttonVariant: "outline",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Simplified pricing
          </h2>
          <p className="text-muted-foreground">
            Our pricing is simple and transparent, you just pay
            <br className="hidden md:block" /> for the learning plan that fits
            your needs.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border p-6 bg-white dark:bg-zinc-900 ${
                  plan.popular
                    ? "border-foreground ring-1 ring-foreground"
                    : "border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-foreground text-background text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      /month
                    </span>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={plan.ctaLink} className="block">
                  <button
                    className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap tracking-tight transition-colors duration-75 cursor-pointer disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-1 focus-visible:ring-ring/40 w-full h-10 rounded-full text-sm font-medium ${
                      plan.buttonVariant === "default"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border/60 bg-transparent hover:bg-accent/40 text-foreground"
                    } px-3 py-1.5`}
                  >
                    {plan.ctaText}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}

