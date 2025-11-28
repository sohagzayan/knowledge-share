"use client";

import { Badge } from "@/components/ui/badge";
import { Target, Flame, Trophy, MessageSquare, Award } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type BadgeType =
  | "FirstLessonCompleted"
  | "SevenDayStreak"
  | "HundredPercentProgress"
  | "DiscussionContributor"
  | "MonthlyTopPerformer"
  | "WeeklyTopPerformer";

interface StudentBadge {
  badgeType: BadgeType;
  earnedAt: Date;
  metadata?: any;
}

interface StudentBadgesProps {
  badges: StudentBadge[];
  loading?: boolean;
}

const badgeConfig: Record<BadgeType, { label: string; icon: React.ReactNode; className: string }> = {
  FirstLessonCompleted: {
    label: "First Lesson",
    icon: <Target className="h-3 w-3" />,
    className: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50",
  },
  SevenDayStreak: {
    label: "7-Day Streak",
    icon: <Flame className="h-3 w-3" />,
    className: "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50",
  },
  HundredPercentProgress: {
    label: "100% Progress",
    icon: <Trophy className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50",
  },
  DiscussionContributor: {
    label: "Discussion Contributor",
    icon: <MessageSquare className="h-3 w-3" />,
    className: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/50",
  },
  MonthlyTopPerformer: {
    label: "Monthly Top",
    icon: <Award className="h-3 w-3" />,
    className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50",
  },
  WeeklyTopPerformer: {
    label: "Weekly Top",
    icon: <Award className="h-3 w-3" />,
    className: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/50",
  },
};

export function StudentBadges({ badges, loading = false }: StudentBadgesProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {[1, 2].map((i) => (
          <div key={i} className="h-5 w-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return <div className="text-xs text-muted-foreground">No badges</div>;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1.5">
        {badges.map((badge, index) => {
          const config = badgeConfig[badge.badgeType];
          return (
            <Tooltip key={badge.badgeType}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Badge
                    variant="outline"
                    className={`${config.className} text-xs flex items-center gap-1 cursor-help`}
                  >
                    {config.icon}
                    {config.label}
                  </Badge>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                  {badge.metadata?.streakCount && ` (${badge.metadata.streakCount} day streak)`}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

