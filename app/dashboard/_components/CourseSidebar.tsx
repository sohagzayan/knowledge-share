"use client";

import React from "react";
import { CourseSidebarDataType } from "@/app/data/course/get-course-sidebar-data";
import { Button } from "@/components/ui/button";
import {
  CollapsibleContent,
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Play, Lock, Coins } from "lucide-react";
import { LessonItem } from "./LessonItem";
import { usePathname } from "next/navigation";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { ChapterCountdown } from "./ChapterCountdown";

interface iAppProps {
  course: CourseSidebarDataType["course"];
  userPoints?: number;
  userId?: string;
}

export function CourseSidebar({ course, userPoints = 0, userId }: iAppProps) {
  const pathname = usePathname();
  const currentLessonId = pathname.split("/").pop();
  const slug = pathname.split("/")[2];

  const { completedLessons, totalLessons, progressPercentage } =
    useCourseProgress({ courseData: course });

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 pr-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="size-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-base leading-tight truncate">
              {course.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {course.category}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedLessons}/{totalLessons} lessons
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {progressPercentage}% complete
          </p>
        </div>

        {/* Points Display */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <Coins className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <div className="text-xs font-medium text-muted-foreground">Your Points</div>
            <div className="text-sm font-bold text-primary">{userPoints}</div>
          </div>
        </div>
      </div>

      <div className="py-4 pr-4 space-y-3">
        {course.chapter.map((chapter, chapterIndex) => {
          const isCurrentChapter = chapter.lessons.some(
            (lesson) => lesson.id === currentLessonId
          );

          const isChapterReleased =
            !chapter.releaseAt || new Date(chapter.releaseAt) <= new Date();
          const isEarlyUnlocked = (chapter as any).isEarlyUnlocked || false;

          // Accessible = either time has passed or user spent points
          const isChapterAccessible = isChapterReleased || isEarlyUnlocked;

          // Time-locked specifically (scheduled in future and not early-unlocked)
          const isTimeLocked =
            !!chapter.releaseAt && !isChapterReleased && !isEarlyUnlocked;

          // Overall lock state for header (either progression lock or time lock)
          const isChapterFullyLocked = !isChapterAccessible && (chapter.locked || isTimeLocked);

          const showCountdown = isTimeLocked;

          // Check if all previous chapters' lessons are completed (for early unlock prerequisite)
          let canUnlockChapter = true;
          if (chapterIndex > 0) {
            // Check all previous chapters
            for (let i = 0; i < chapterIndex; i++) {
              const prevChapter = course.chapter[i];
              const allPrevLessonsCompleted = prevChapter.lessons.every((l) => {
                return l.lessonProgress.some((progress) => progress.completed);
              });
              if (!allPrevLessonsCompleted) {
                canUnlockChapter = false;
                break;
              }
            }
          }

          return (
            <div key={chapter.id} className="space-y-2">
              {showCountdown && chapter.releaseAt && (
                <div className="flex justify-center px-2">
                  <ChapterCountdown
                    chapterId={chapter.id}
                    releaseAt={chapter.releaseAt}
                    slug={slug}
                    userPoints={userPoints}
                    canUnlock={canUnlockChapter}
                    onUnlock={() => window.location.reload()}
                  />
                </div>
              )}
              <Collapsible
                key={chapter.id}
                defaultOpen={isCurrentChapter || (!currentLessonId && chapterIndex === 0)}
                disabled={isChapterFullyLocked}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full p-3 h-auto flex items-center gap-2 ${
                      chapter.locked && !isChapterAccessible
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={chapter.locked && !isChapterAccessible}
                  >
                    <div className="shrink-0">
                      {isChapterFullyLocked ? (
                        <Lock className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-semibold text-sm truncate text-foreground">
                        {chapter.position}: {chapter.title}
                        {isEarlyUnlocked && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs bg-green-500/20 text-green-700 dark:text-green-400"
                          >
                            Early Unlocked
                          </Badge>
                        )}
                        {isChapterFullyLocked && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Locked)
                          </span>
                        )}
                      </p>

                      <p className="text-[10px] text-muted-foreground font-medium truncate">
                        {chapter.lessons.length} lessons
                      </p>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 pl-6 border-l-2 space-y-3">
                  {chapter.lessons.map((lesson, lessonIndex) => {
                    let blockingLesson: { id: string; title: string } | null =
                      null;

                    if (lesson.locked) {
                      if (lessonIndex > 0) {
                        // Blocked by previous lesson in same chapter
                        const prevLesson = chapter.lessons[lessonIndex - 1];
                        if (prevLesson) {
                          blockingLesson = {
                            id: prevLesson.id,
                            title: prevLesson.title,
                          };
                        }
                      } else if (chapterIndex > 0) {
                        // First lesson in this chapter: blocked by last lesson of previous chapter
                        const previousChapter =
                          course.chapter[chapterIndex - 1];
                        const lastLessonOfPrevChapter =
                          previousChapter.lessons[
                            previousChapter.lessons.length - 1
                          ];
                        if (lastLessonOfPrevChapter) {
                          blockingLesson = {
                            id: lastLessonOfPrevChapter.id,
                            title: lastLessonOfPrevChapter.title,
                          };
                        }
                      }
                    }

                    const isTimeLocked = (lesson as any).isTimeLocked || false;
                    const isEarlyUnlocked = (lesson as any).isEarlyUnlocked || false;

                    // Check if all previous lessons are completed (for early unlock prerequisite)
                    let canUnlockLesson = true;
                    if (lessonIndex > 0) {
                      // Check previous lesson in same chapter
                      const prevLesson = chapter.lessons[lessonIndex - 1];
                      const isPrevCompleted = prevLesson.lessonProgress.some((progress) => progress.completed);
                      if (!isPrevCompleted) {
                        canUnlockLesson = false;
                      }
                    } else if (chapterIndex > 0) {
                      // First lesson of a chapter - check last lesson of previous chapter
                      const previousChapter = course.chapter[chapterIndex - 1];
                      const lastLessonOfPrevChapter = previousChapter.lessons[previousChapter.lessons.length - 1];
                      if (lastLessonOfPrevChapter) {
                        const isLastCompleted = lastLessonOfPrevChapter.lessonProgress.some((progress) => progress.completed);
                        if (!isLastCompleted) {
                          canUnlockLesson = false;
                        }
                      }
                    }

                    return (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        slug={course.slug}
                        isActive={currentLessonId === lesson.id}
                        completed={
                          lesson.lessonProgress.find(
                            (progress) => progress.lessonId === lesson.id
                          )?.completed || false
                        }
                        locked={lesson.locked || false}
                        isTimeLocked={isTimeLocked}
                        isEarlyUnlocked={isEarlyUnlocked}
                        userPoints={userPoints}
                        canUnlock={canUnlockLesson}
                        blockingLesson={blockingLesson}
                      />
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}
      </div>
    </div>
  );
}
