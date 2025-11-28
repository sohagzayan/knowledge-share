"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

interface LeaderboardStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  progress: {
    totalLessons: number;
    completedLessons: number;
    percentage: number;
  };
  totalPoints: number;
  streakDays?: number;
}

interface EnhancedLeaderboardProps {
  students: LeaderboardStudent[];
  loading?: boolean;
}

type LeaderboardPeriod = "all-time" | "monthly" | "weekly";

export function EnhancedLeaderboard({ students, loading = false }: EnhancedLeaderboardProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all-time");

  const filteredStudents = useMemo(() => {
    if (loading || !students) return [];
    
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return students
      .filter((student) => {
        if (period === "all-time") return true;
        // For monthly/weekly, you'd filter based on activity dates
        // This is a simplified version - you'd need to add activity tracking
        return true;
      })
      .sort((a, b) => {
        // Sort by points first, then by progress
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        return b.progress.percentage - a.progress.percentage;
      })
      .slice(0, 10); // Top 10
  }, [students, period, loading]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-time">All-Time</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No students on leaderboard yet
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(index + 1)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.image || undefined} />
                    <AvatarFallback>
                      {student.firstName[0]}
                      {student.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {student.email}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {student.streakDays && student.streakDays > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/50 flex items-center gap-1"
                      >
                        <Flame className="h-3 w-3" />
                        {student.streakDays} days
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="font-semibold">{student.totalPoints} pts</div>
                      <div className="text-xs text-muted-foreground">
                        {student.progress.percentage}% complete
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

