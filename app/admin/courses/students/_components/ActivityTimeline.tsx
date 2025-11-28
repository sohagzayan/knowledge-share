"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  BookOpen,
  Download,
  FileX,
  FileCheck,
  Eye,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Activity {
  id: string;
  type: string;
  description: string | null;
  createdAt: Date;
  metadata?: any;
}

interface ActivityTimelineProps {
  enrollmentId: string;
  courseId: string;
  userId: string;
}

const activityIcons: Record<string, React.ReactNode> = {
  LoggedIn: <LogIn className="h-4 w-4" />,
  CompletedLesson: <BookOpen className="h-4 w-4" />,
  DownloadedFile: <Download className="h-4 w-4" />,
  MissedAssignment: <FileX className="h-4 w-4" />,
  SubmittedAssignment: <FileCheck className="h-4 w-4" />,
  ViewedLesson: <Eye className="h-4 w-4" />,
  StartedCourse: <Play className="h-4 w-4" />,
};

const activityColors: Record<string, string> = {
  LoggedIn: "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50",
  CompletedLesson: "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50",
  DownloadedFile: "bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/50",
  MissedAssignment: "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50",
  SubmittedAssignment: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50",
  ViewedLesson: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/50",
  StartedCourse: "bg-pink-500/20 text-pink-700 dark:text-pink-400 border-pink-500/50",
};

export function ActivityTimeline({ enrollmentId, courseId, userId }: ActivityTimelineProps) {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/students/${userId}/activities`
      );
      if (response.ok) {
        const data = await response.json();
        setActivities(data || []);
      }
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadActivities();
    }
  }, [open, courseId, userId]);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="h-7 text-xs"
      >
        View Activity
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Student Activity Timeline</DialogTitle>
            <DialogDescription>
              Complete history of student activities in this course
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No activities recorded yet
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="relative pl-10"
                    >
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-background border-2 border-border flex items-center justify-center">
                        <div className={`${activityColors[activity.type] || "bg-muted"} p-1.5 rounded-full`}>
                          {activityIcons[activity.type] || <LogIn className="h-3 w-3" />}
                        </div>
                      </div>
                      <div className="bg-card border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className={`${activityColors[activity.type] || "bg-muted"} text-xs`}
                          >
                            {activity.type.replace(/([A-Z])/g, " $1").trim()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-foreground mt-1">{activity.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

