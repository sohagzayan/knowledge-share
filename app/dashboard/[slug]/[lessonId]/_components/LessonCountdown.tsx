"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Unlock, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { unlockLessonEarly } from "../../actions";
import { toast } from "sonner";
import { useTransition } from "react";

interface LessonCountdownProps {
  lessonId: string;
  releaseAt: Date;
  slug: string;
  userPoints: number;
  onUnlock?: () => void;
}

const EARLY_UNLOCK_COST = 7;

export function LessonCountdown({
  lessonId,
  releaseAt,
  slug,
  userPoints,
  onUnlock,
}: LessonCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const release = new Date(releaseAt).getTime();
      const difference = release - now;

      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [releaseAt]);

  const handleEarlyUnlock = () => {
    if (userPoints < EARLY_UNLOCK_COST) {
      toast.error(`Insufficient points. You need ${EARLY_UNLOCK_COST} points but only have ${userPoints} points.`);
      return;
    }

    startTransition(async () => {
      const result = await unlockLessonEarly(lessonId, slug);
      if (result.status === "success") {
        toast.success(result.message);
        onUnlock?.();
      } else {
        toast.error(result.message);
      }
    });
  };

  if (!timeLeft) {
    return null; // Lesson is released
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full max-w-md flex-col gap-3 p-4 rounded-lg border bg-muted/50 mx-auto"
    >
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            Lesson releases in:
          </div>
          <div className="flex items-center gap-2">
            {timeLeft.days > 0 && (
              <Badge variant="outline" className="text-xs">
                {timeLeft.days}d
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {String(timeLeft.hours).padStart(2, "0")}h
            </Badge>
            <Badge variant="outline" className="text-xs">
              {String(timeLeft.minutes).padStart(2, "0")}m
            </Badge>
            <Badge variant="outline" className="text-xs">
              {String(timeLeft.seconds).padStart(2, "0")}s
            </Badge>
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleEarlyUnlock}
        disabled={pending}
        className="gap-2 w-full justify-center"
      >
        <Unlock className="h-3 w-3" />
        <Coins className="h-3 w-3" />
        Unlock ({EARLY_UNLOCK_COST} pts)
      </Button>
    </motion.div>
  );
}

