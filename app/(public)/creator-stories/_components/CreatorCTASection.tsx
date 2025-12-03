"use client";

import { useEffect, useState } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function CreatorCTASection() {
  const { ref, isVisible: inView } = useRevealOnScroll<HTMLElement>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-muted/20 via-background to-background"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "0.25s" }}
          >
            Ready to Start Learning?
          </h2>

          <p
            className={`text-lg md:text-xl text-muted-foreground mb-8 transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            Explore courses created by our expert instructors and begin your learning journey today.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.55s" }}
          >
            <Link
              href="/courses"
              className={buttonVariants({
                size: "lg",
                className: "group relative px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300",
              })}
            >
              <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Browse All Courses
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>

            <Link
              href="/become-an-instructor"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "group relative px-6 py-3 text-base font-semibold border-2 hover:border-primary transition-all duration-300",
              })}
            >
              Become a Creator
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
