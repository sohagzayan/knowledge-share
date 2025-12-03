"use client";

import { useEffect, useState } from "react";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { Sparkles, Users, BookOpen, Award } from "lucide-react";

export function CreatorHeroSection() {
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
      className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-background via-background to-muted/20"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Icon with animation */}
          <div
            className={`transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-50 rotate-12"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4 group">
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          {/* Main heading */}
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: "0.25s" }}
          >
            <span className="block text-primary">Meet Our Creators</span>
            <span className="block text-foreground mt-2">Expert Teachers & Course Builders</span>
          </h1>

          {/* Description */}
          <p
            className={`max-w-2xl text-muted-foreground text-base md:text-lg lg:text-xl mt-4 font-normal transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            Discover the talented educators behind our courses. These dedicated creators design, 
            develop, and deliver world-class learning experiences to help you achieve your goals.
          </p>

          {/* Stats */}
          <div
            className={`grid grid-cols-3 gap-6 md:gap-8 mt-12 w-full max-w-2xl transition-all duration-700 ease-out ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: "0.55s" }}
          >
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">Expert</div>
              <div className="text-sm text-muted-foreground mt-1">Instructors</div>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Courses</div>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors duration-300">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">Quality</div>
              <div className="text-sm text-muted-foreground mt-1">Content</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
