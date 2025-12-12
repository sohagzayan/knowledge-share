"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
}

const featureCards: FeatureCardProps[] = [
  {
    number: "01",
    title: "Learn the latest skills",
    description:
      "Access cutting-edge courses designed by industry experts to keep you ahead of the curve.",
  },
  {
    number: "02",
    title: "Get ready for a career",
    description:
      "Build practical skills and real-world projects that employers are looking for.",
  },
  {
    number: "03",
    title: "Earn a Certificate",
    description:
      "Receive recognized certificates upon completion to showcase your achievements.",
  },
  {
    number: "04",
    title: "Upskill your organization",
    description:
      "Empower your team with comprehensive training programs tailored to your needs.",
  },
];

export default function WhyLearnSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium uppercase tracking-wider mb-4 text-emerald-500">
            WHY LEARN WITH US
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Build better skills, faster
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-base md:text-lg">
            Explore new skills, deepen existing passions, and get lost in
            creativity. What you find just might surprise and inspire you.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((card, index) => (
            <Card
              key={index}
              className="border border-border/50 bg-card hover:border-border transition-all duration-300"
            >
              <CardHeader>
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-4 bg-emerald-500">
                  <span className="text-white text-2xl font-bold">
                    {card.number}
                  </span>
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
