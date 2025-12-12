"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the free plan work?",
    answer:
      "The free plan gives you access to 5 free courses with basic progress tracking and community support. You can upgrade anytime to unlock unlimited courses and advanced features.",
  },
  {
    question: "What's the course completion rate?",
    answer:
      "Our platform has a 99.9% course completion rate. Students who enroll in our courses typically complete them due to our engaging content, progress tracking, and support system.",
  },
  {
    question: "Can I access courses on mobile?",
    answer:
      "Yes! Our platform is fully responsive and works on all devices. You can access your courses, track progress, and watch lessons on your phone, tablet, or desktop.",
  },
  {
    question: "How do I track my learning progress?",
    answer:
      "Every course includes detailed progress tracking. You can see which lessons you've completed, your overall progress percentage, and earn certificates upon completion. Premium plans include advanced analytics.",
  },
  {
    question: "Do you offer certificates?",
    answer:
      "Yes! All plans include certificates of completion for finished courses. Premium plans also offer downloadable certificates and detailed learning transcripts.",
  },
  {
    question: "What's included in each plan?",
    answer:
      "The Free plan includes 5 courses and basic features. Pro plan ($20/month) offers unlimited courses, priority support, and downloadable resources. Scale plan ($100/month) adds team management, custom learning paths, and dedicated support.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-24">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about our platform
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

