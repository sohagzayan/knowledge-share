"use client";

import { Badge } from "@/components/ui/badge";
import { FileCheck, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssignmentAnalyticsProps {
  submitted: number;
  late: number;
  pending: number;
  total: number;
  loading?: boolean;
}

export function AssignmentAnalytics({
  submitted,
  late,
  pending,
  total,
  loading = false,
}: AssignmentAnalyticsProps) {
  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const submittedPercentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const latePercentage = total > 0 ? Math.round((late / total) * 100) : 0;
  const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50 text-xs flex items-center gap-1 cursor-help"
            >
              <FileCheck className="h-3 w-3" />
              {submitted}/{total}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Submitted: {submitted} ({submittedPercentage}%)</p>
          </TooltipContent>
        </Tooltip>

        {late > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50 text-xs flex items-center gap-1 cursor-help"
              >
                <Clock className="h-3 w-3" />
                {late} Late
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Late Submissions: {late} ({latePercentage}%)</p>
            </TooltipContent>
          </Tooltip>
        )}

        {pending > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50 text-xs flex items-center gap-1 cursor-help"
              >
                <AlertCircle className="h-3 w-3" />
                {pending} Pending
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pending: {pending} ({pendingPercentage}%)</p>
            </TooltipContent>
          </Tooltip>
        )}
      </motion.div>
    </TooltipProvider>
  );
}

