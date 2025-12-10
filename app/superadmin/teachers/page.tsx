"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

interface TeacherPerformance {
  teacherId: string;
  teacherName: string;
  email: string;
  image: string | null;
  totalStudents: number;
  totalCourses: number;
  totalHours: number;
  avgRating: number;
  avgCompletionRate: number;
  totalRevenue: number;
  uploadActivity: number;
  joinedAt: string;
  rank: number;
}

interface TeacherApplication {
  id: string;
  userId: string;
  status: "Pending" | "Approved" | "Rejected";
  applicationData: any;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string | null;
    email: string;
    image: string | null;
  };
}

export default function TeachersPage() {
  const [performance, setPerformance] = useState<TeacherPerformance[]>([]);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("performance");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "performance") {
        const res = await fetch("/api/superadmin/teachers/performance");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setPerformance(data);
        } else {
          const errorMessage = data?.error || "Failed to fetch performance data";
          console.error("Failed to fetch performance data:", errorMessage, data);
          setPerformance([]);
        }
      } else if (activeTab === "applications") {
        const res = await fetch("/api/superadmin/teachers/applications");
        const data = await res.json();
        if (res.ok && Array.isArray(data)) {
          setApplications(data);
        } else {
          const errorMessage = data?.error || "Failed to fetch applications data";
          console.error("Failed to fetch applications data:", errorMessage, data);
          setApplications([]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      if (activeTab === "performance") {
        setPerformance([]);
      } else {
        setApplications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (
    applicationId: string,
    action: "Approved" | "Rejected",
    rejectionReason?: string
  ) => {
    try {
      const res = await fetch(
        `/api/superadmin/teachers/applications/${applicationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: action,
            rejectionReason,
          }),
        }
      );
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to update application:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Management</h1>
        <p className="text-muted-foreground">
          Monitor teacher performance and manage teacher applications
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="performance">Performance Dashboard</TabsTrigger>
          <TabsTrigger value="applications">Teacher Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Performance Rankings</CardTitle>
              <CardDescription>
                Top performing teachers based on revenue, students, and ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map((teacher) => (
                      <TableRow key={teacher.teacherId}>
                        <TableCell>
                          <Badge variant="outline">#{teacher.rank}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={teacher.image || undefined} />
                              <AvatarFallback>
                                {teacher.teacherName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{teacher.teacherName}</div>
                              <div className="text-sm text-muted-foreground">
                                {teacher.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{teacher.totalStudents}</TableCell>
                        <TableCell>{teacher.totalCourses}</TableCell>
                        <TableCell>{teacher.totalHours}h</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{teacher.avgRating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell>{teacher.avgCompletionRate}%</TableCell>
                        <TableCell className="font-semibold">
                          ${(teacher.totalRevenue / 100).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Applications</CardTitle>
              <CardDescription>
                Review and approve teacher applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={app.user.image || undefined} />
                              <AvatarFallback>
                                {app.user.firstName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {app.user.firstName} {app.user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {app.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.status === "Pending" && (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                          {app.status === "Approved" && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approved
                            </Badge>
                          )}
                          {app.status === "Rejected" && (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {app.status === "Pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleApplicationAction(app.id, "Approved")
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleApplicationAction(app.id, "Rejected", "Rejected by admin")
                                }
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
