"use client";

import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle, Clock, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export type StudentTagType = "TopPerformer" | "NeedsHelp" | "SlowLearner" | "ActiveCommunicator";

const tagConfig: Record<StudentTagType, { label: string; icon: React.ReactNode; className: string }> = {
  TopPerformer: {
    label: "Top Performer",
    icon: <Star className="h-3 w-3" />,
    className: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50",
  },
  NeedsHelp: {
    label: "Needs Help",
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50",
  },
  SlowLearner: {
    label: "Slow Learner",
    icon: <Clock className="h-3 w-3" />,
    className: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50",
  },
  ActiveCommunicator: {
    label: "Active Communicator",
    icon: <MessageSquare className="h-3 w-3" />,
    className: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50",
  },
};

interface StudentTagsProps {
  tags: StudentTagType[];
  onTagChange?: (tags: StudentTagType[]) => void;
  editable?: boolean;
  loading?: boolean;
}

export function StudentTags({ tags, onTagChange, editable = false, loading = false }: StudentTagsProps) {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {[1, 2].map((i) => (
          <div key={i} className="h-5 w-20 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        {editable ? "Click to add tags" : "No tags"}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, index) => {
        const config = tagConfig[tag];
        return (
          <motion.div
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Badge
              variant="outline"
              className={`${config.className} text-xs flex items-center gap-1`}
            >
              {config.icon}
              {config.label}
            </Badge>
          </motion.div>
        );
      })}
    </div>
  );
}

