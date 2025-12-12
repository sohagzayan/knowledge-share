"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Mail, Users, BarChart3 } from "lucide-react";

interface TabContent {
  title: string;
  items: {
    label: string;
    color: string;
  }[];
}

const tabContents: TabContent[] = [
  {
    title: "Course Categories",
    items: [
      { label: "Web Development", color: "bg-blue-500" },
      { label: "Data Science", color: "bg-blue-500" },
      { label: "Mobile Development", color: "bg-blue-500" },
    ],
  },
  {
    title: "Learners",
    items: [
      { label: "Active Students (2,451)", color: "bg-purple-500" },
      { label: "Instructors (892)", color: "bg-purple-500" },
      { label: "Enrolled Courses (1,204)", color: "bg-purple-500" },
    ],
  },
  {
    title: "This week",
    items: [
      { label: "Completions: 68.4%", color: "bg-emerald-500" },
      { label: "Engagement: 12.3%", color: "bg-emerald-500" },
      { label: "Satisfaction: 99.8%", color: "bg-emerald-500" },
    ],
  },
];

export default function EverythingInOnePlaceSection() {
  const [activeTab, setActiveTab] = useState(0);

  // Auto-cycle through tabs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3);
    }, 4000); // Change tab every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { icon: Mail, label: "Courses" },
    { icon: Users, label: "Learners" },
    { icon: BarChart3, label: "Analytics" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-border/50 p-4 h-80 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Auto-cycling tabs
                </span>
              </div>
              <div className="flex gap-1 p-1 bg-white dark:bg-zinc-800 rounded-xl mb-3 border border-border/30">
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-medium transition-all duration-300 ${
                        activeTab === index
                          ? "bg-zinc-100 dark:bg-zinc-700 shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                      }`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          activeTab === index
                            ? "text-blue-500"
                            : "text-current"
                        }`}
                      />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="relative flex-1">
                {tabContents.map((content, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ${
                      activeTab === index
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 translate-x-4"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        {content.title}
                      </p>
                      {content.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/50 transition-all duration-300"
                          style={{
                            transitionDelay: `${itemIndex * 100}ms`,
                          }}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                          ></div>
                          <span className="text-[12px] font-medium">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-border/50">
                {tabs.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeTab === index
                        ? "w-4 bg-foreground"
                        : "w-1 bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Everything in one place
            </h2>
            <p className="text-muted-foreground mb-6">
              Access courses, track progress, and manage your learning journey
              from a single platform. Browse courses, connect with instructors,
              and monitor your analytics - all without switching tools.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Courses &amp; learning paths
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Student &amp; instructor management
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Progress tracking &amp; analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

