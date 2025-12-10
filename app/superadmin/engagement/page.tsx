"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Users, Trophy, Search, Clock } from "lucide-react";

export default function EngagementPage() {
  const [onlineStatus, setOnlineStatus] = useState<any>(null);
  const [learningTime, setLearningTime] = useState<any>(null);
  const [searchAnalytics, setSearchAnalytics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh online status every 30 seconds
    const interval = setInterval(() => {
      fetchOnlineStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [onlineRes, learningRes, searchRes, leaderRes] = await Promise.all([
        fetch("/api/superadmin/engagement/online-status"),
        fetch("/api/superadmin/engagement/learning-time?period=day"),
        fetch("/api/superadmin/engagement/search-analytics"),
        fetch("/api/superadmin/engagement/leaderboard"),
      ]);
      setOnlineStatus(await onlineRes.json());
      setLearningTime(await learningRes.json());
      setSearchAnalytics(await searchRes.json());
      setLeaderboard(await leaderRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnlineStatus = async () => {
    try {
      const res = await fetch("/api/superadmin/engagement/online-status");
      setOnlineStatus(await res.json());
    } catch (error) {
      console.error("Failed to fetch online status:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement Analytics</h1>
        <p className="text-muted-foreground">
          Monitor user engagement, learning patterns, and activity
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {onlineStatus?.totalOnline || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {onlineStatus?.studentsOnline || 0} students,{" "}
                  {onlineStatus?.teachersOnline || 0} teachers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Minutes Viewed</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {learningTime?.totalMinutesViewed || 0}
                </div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Searches</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {searchAnalytics?.mostSearchedTopics?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Tracked topics</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaderboard.length}</div>
                <p className="text-xs text-muted-foreground">Top students</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="online">
            <TabsList>
              <TabsTrigger value="online">Online Status</TabsTrigger>
              <TabsTrigger value="learning">Learning Time</TabsTrigger>
              <TabsTrigger value="search">Search Analytics</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="online" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Currently Online Users</CardTitle>
                  <CardDescription>
                    Users active in the last 5 minutes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {onlineStatus?.onlineUsers?.slice(0, 20).map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src={user.image || undefined} />
                                <AvatarFallback>
                                  {user.firstName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role || "user"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Students Leaderboard</CardTitle>
                  <CardDescription>
                    Ranked by consistency, hours watched, and courses completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Consistency</TableHead>
                        <TableHead>Hours Watched</TableHead>
                        <TableHead>Courses Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <Badge variant="outline">#{student.rank}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src={student.image || undefined} />
                                <AvatarFallback>
                                  {student.studentName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {student.studentName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {student.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{student.consistency} days</TableCell>
                          <TableCell>{student.hoursWatched}h</TableCell>
                          <TableCell>{student.coursesCompleted}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Most Searched Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Searches</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchAnalytics?.mostSearchedTopics?.map((item: any) => (
                        <TableRow key={item.query}>
                          <TableCell className="font-medium">
                            {item.query}
                          </TableCell>
                          <TableCell>{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Zero Result Searches</CardTitle>
                  <CardDescription>
                    Searches with no results - potential content gaps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Query</TableHead>
                        <TableHead>Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchAnalytics?.zeroResultSearches?.map((item: any) => (
                        <TableRow key={item.query}>
                          <TableCell className="font-medium">
                            {item.query}
                          </TableCell>
                          <TableCell>{item.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
