"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Play, Lock, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LessonCountdown } from "./LessonCountdown";

interface iAppProps {
  lesson: {
    id: string;
    title: string;
    position: number;
    description: string | null;
    releaseAt?: Date | string | null;
  };
  slug: string;
  isActive?: boolean;
  completed: boolean;
  locked?: boolean;
  isTimeLocked?: boolean;
  isEarlyUnlocked?: boolean;
  userPoints?: number;
  canUnlock?: boolean;
  blockingLesson?: {
    id: string;
    title: string;
  } | null;
}

export function LessonItem({
  lesson,
  slug,
  isActive,
  completed,
  locked = false,
  isTimeLocked = false,
  isEarlyUnlocked = false,
  userPoints = 0,
  canUnlock = true,
  blockingLesson,
}: iAppProps) {
  const router = useRouter();

  // Check if lesson is scheduled (has future releaseAt and not early unlocked)
  const isScheduled = 
    lesson.releaseAt && 
    new Date(lesson.releaseAt) > new Date() && 
    !isEarlyUnlocked;

  // If lesson is time-locked (scheduled), show countdown and make it non-clickable
  if (isTimeLocked && isScheduled && lesson.releaseAt) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled
          className={buttonVariants({
            variant: "outline",
            className: cn(
              "w-full p-2.5 h-auto justify-start transition-all opacity-60 cursor-not-allowed"
            ),
          })}
        >
          <div className="flex items-start gap-2.5 w-full min-w-0">
            <div className="shrink-0 pt-0.5">
              <div className="size-5 rounded-full border-2 border-muted-foreground/40 bg-muted/50 flex justify-center items-center">
                <Clock className="size-3 text-muted-foreground" />
              </div>
            </div>

            <div className="flex-1 text-left min-w-0 overflow-hidden">
              <p className="test-xs font-medium truncate text-muted-foreground">
                {lesson.position}. {lesson.title}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium break-words whitespace-normal leading-tight mt-0.5">
                Scheduled - Unlock with points or wait for release
              </p>
            </div>
          </div>
        </button>
        <div className="pl-2">
          <LessonCountdown
            lessonId={lesson.id}
            releaseAt={lesson.releaseAt}
            slug={slug}
            userPoints={userPoints}
            canUnlock={canUnlock}
            onUnlock={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (locked) {
    const handleClick = () => {
      if (blockingLesson) {
        toast.info(
          `Complete \"${blockingLesson.title}\" before accessing this lesson. Redirecting you there now.`
        );
        router.push(`/dashboard/${slug}/${blockingLesson.id}`);
      } else {
        toast.info("Complete the previous lesson before accessing this one.");
      }
    };

    return (
      <button
        type="button"
        onClick={handleClick}
        className={buttonVariants({
          variant: "outline",
          className: cn(
            "w-full p-2.5 h-auto justify-start transition-all opacity-80 cursor-pointer"
          ),
        })}
      >
        <div className="flex items-center gap-2.5 w-full min-w-0">
          <div className="shrink-0">
            <div className="size-5 rounded-full border-2 border-muted-foreground/40 bg-muted/50 flex justify-center items-center">
              <Lock className="size-3 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 text-left min-w-0">
            <p className="test-xs font-medium truncate text-muted-foreground">
              {lesson.position}. {lesson.title}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">
              Locked - Complete the required lesson first
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <Link
      href={`/dashboard/${slug}/${lesson.id}`}
      className={buttonVariants({
        variant: completed ? "secondary" : "outline",
        className: cn(
          "w-full p-2.5 h-auto justify-start transition-all",
          completed &&
            "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-200",

          isActive &&
            !completed &&
            "bg-primary/10 dark:bg-primary/20 border-primary/50 hover:bg-primary/20 dark:hover:bg-primary/30 text-primary"
        ),
      })}
    >
      <div className="flex items-center gap-2.5 w-full min-w-0">
        <div className="shrink-0">
          {completed ? (
            <div className="size-5 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
              <Check className="size-3 text-white" />
            </div>
          ) : (
            <div
              className={cn(
                "size-5 rounded-full border-2 bg-background flex justify-center items-center",
                isActive
                  ? "border-primary bg-primary/10 dark:bg-primary/20"
                  : "border-muted-foreground/60"
              )}
            >
              <Play
                className={cn(
                  "size-2.5 fill-current",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <p
            className={cn(
              "test-xs font-medium truncate",
              completed
                ? "text-green-800 dark:text-green-200"
                : isActive
                  ? "text-primary font-semibold"
                  : "text-foreground"
            )}
          >
            {lesson.position}. {lesson.title}
          </p>
          {completed && (
            <p className="text-[10px] text-green-700 dark:text-green-300 font-medium">
              Completed
            </p>
          )}

          {isActive && !completed && (
            <p className="text-[10px] text-primary font-mediums">
              Currently Watching
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
