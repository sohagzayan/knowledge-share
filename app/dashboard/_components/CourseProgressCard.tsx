/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { EnrolledCourseType } from "@/app/data/user/get-enrolled-courses";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { useCourseProgress } from "@/hooks/use-course-progress";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Video, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface iAppProps {
  data: EnrolledCourseType;
  courseId: string;
}

interface ActiveSession {
  id: string;
  streamCallId: string | null;
  title: string | null;
  description: string | null;
  createdAt: Date;
  Creator: {
    firstName: string | null;
    lastName: string | null;
  };
}

export function CourseProgressCard({ data, courseId }: iAppProps) {
  const thumbnailUrl = useConstructUrl(data.Course.fileKey);
  const { totalLessons, completedLessons, progressPercentage } =
    useCourseProgress({ courseData: data.Course as any });
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const response = await fetch(`/api/support-calls/active?courseId=${courseId}`);
        if (response.ok) {
          const sessions = await response.json();
          setActiveSessions(sessions);
        }
      } catch (error) {
        console.error("Error fetching active sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveSessions();
    // Refresh every 30 seconds to check for new sessions
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, [courseId]);

  const handleJoinSession = (streamCallId: string) => {
    router.push(`/call/${streamCallId}`);
  };

  return (
    <Card className="group relative py-0 gap-0">
      <Badge className="absolute top-2 right-2 z-10">{data.Course.level}</Badge>

      <Image
        width={600}
        height={400}
        className="w-full rounded-t-xl aspect-video h-full object-cover"
        src={thumbnailUrl}
        alt="Thumbail Image of Course"
      />

      <CardContent className="p-4">
        <Link
          className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
          href={`/dashboard/${data.Course.slug}`}
        >
          {data.Course.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
          {data.Course.smallDescription}
        </p>

        <div className="space-y-4 mt-5">
          <div className="flex justify-between mb-1 text-sm">
            <p>Progress:</p>
            <p className="font-medium">{progressPercentage}%</p>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />

          <p className="text-xs text-muted-foreground mt-1">
            {completedLessons} of {totalLessons} lessons completed
          </p>
        </div>

        {/* Active Support Sessions */}
        {!isLoading && activeSessions.length > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-primary">
                Active Support Session{activeSessions.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="space-y-2">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-2 bg-background rounded border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.title || "Support Session"}
                    </p>
                    {session.Creator && (
                      <p className="text-xs text-muted-foreground">
                        Host: {session.Creator.firstName} {session.Creator.lastName}
                      </p>
                    )}
                  </div>
                  {session.streamCallId && (
                    <Button
                      size="sm"
                      onClick={() => handleJoinSession(session.streamCallId!)}
                      className="ml-2"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/dashboard/${data.Course.slug}`}
          className={buttonVariants({ className: "w-full mt-4" })}
        >
          Learn More
        </Link>
      </CardContent>
    </Card>
  );
}
