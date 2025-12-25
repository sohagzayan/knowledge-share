import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding subscription plans...");

  // Create Free Plan
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "free" },
    update: {},
    create: {
      name: "Free",
      slug: "free",
      description: "Perfect for getting started",
      priceMonthly: 0,
      priceYearly: 0,
      isActive: true,
      isPopular: false,
      trialDays: 0,
      maxCourseAccess: 5,
      allowsDownloads: false,
      allowsCertificates: true, // View-only certificates
      allowsLiveClasses: false,
      allowsTeamAccess: false,
      teamSeats: 1,
      prioritySupport: false,
    },
  });

  console.log("✅ Created Free plan:", freePlan.name);

  // Create Pro Plan
  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "Pro",
      slug: "pro",
      description: "For serious learners",
      priceMonthly: 2000, // $20.00 in cents
      priceYearly: 20000, // $200.00 in cents (save $40/year)
      isActive: true,
      isPopular: true,
      trialDays: 7,
      maxCourseAccess: null, // Unlimited
      allowsDownloads: true,
      allowsCertificates: true,
      allowsLiveClasses: true,
      allowsTeamAccess: false,
      teamSeats: 1,
      prioritySupport: true,
    },
  });

  console.log("✅ Created Pro plan:", proPlan.name);

  // Create Business Plan
  const businessPlan = await prisma.subscriptionPlan.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      name: "Business",
      slug: "business",
      description: "For teams & organizations",
      priceMonthly: 10000, // $100.00 in cents
      priceYearly: 100000, // $1000.00 in cents (save $200/year)
      isActive: true,
      isPopular: false,
      trialDays: 14,
      maxCourseAccess: null, // Unlimited
      allowsDownloads: true,
      allowsCertificates: true,
      allowsLiveClasses: true,
      allowsTeamAccess: true,
      teamSeats: 50,
      prioritySupport: true,
    },
  });

  console.log("✅ Created Business plan:", businessPlan.name);

  console.log("\n🎉 All subscription plans seeded successfully!");
  console.log("\nNote: You'll need to create Stripe products and prices, then update:");
  console.log("  - stripePriceIdMonthly");
  console.log("  - stripePriceIdYearly");
  console.log("\nFor each plan in the database.");
}

main()
  .catch((e) => {
    console.error("Error seeding subscription plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

