"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const { ref, isVisible } = useRevealOnScroll<HTMLElement>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission here
    console.log("Email submitted:", email);
  };

  return (
    <section ref={ref} className="py-16 sm:py-20 lg:py-24 px-4">
      <div
        className={`max-w-4xl mx-auto text-center transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          <span className="block uppercase">WHERE WHAT YOU KNOW</span>
          <span className="block uppercase">BECOMES YOUR BUSINESS</span>
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Build courses, communities, and coaching that turn what you know into
          income and trust, all on one platform built for your brand.
        </p>

        {/* Email Input and Button */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 sm:h-14 text-base border-border focus:border-primary"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-8 text-base font-medium whitespace-nowrap"
            >
              Get Started for Free →
            </Button>
          </div>
        </form>

        {/* Legal Notice */}
        <p className="text-xs sm:text-sm text-muted-foreground">
          By proceeding you agree to our{" "}
          <Link
            href="#"
            className="underline hover:text-foreground transition-colors"
          >
            Platform Terms & Privacy Notice
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

