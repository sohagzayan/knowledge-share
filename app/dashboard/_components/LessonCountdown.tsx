"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Unlock, Coins } from "lucide-react";
import { unlockLessonEarly } from "../[slug]/actions";
import { toast } from "sonner";
import { useTransition } from "react";

interface LessonCountdownProps {
  lessonId: string;
  releaseAt: Date | string;
  slug: string;
  userPoints: number;
  canUnlock?: boolean;
  onUnlock?: () => void;
}

const EARLY_UNLOCK_COST = 7;

export function LessonCountdown({
  lessonId,
  releaseAt,
  slug,
  userPoints,
  canUnlock = true,
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
    <div className="flex flex-col gap-2 p-2 rounded-lg border bg-muted/50 text-xs">
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-primary" />
        <span className="text-muted-foreground">Releases in:</span>
        <div className="flex items-center gap-1">
          {timeLeft.days > 0 && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {timeLeft.days}d
            </Badge>
          )}
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {String(timeLeft.hours).padStart(2, "0")}h
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            {String(timeLeft.minutes).padStart(2, "0")}m
          </Badge>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={handleEarlyUnlock}
        disabled={pending || !canUnlock}
        className="gap-1 h-7 text-[10px]"
        title={!canUnlock ? "Complete all previous lessons to unlock early" : undefined}
      >
        <Unlock className="h-3 w-3" />
        <Coins className="h-3 w-3" />
        Unlock ({EARLY_UNLOCK_COST} pts)
      </Button>
      {!canUnlock && (
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Complete previous lessons first
        </p>
      )}
    </div>
  );
}

