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
import { Loader2 } from "lucide-react";

interface CoursePerformance {
  courseId: string;
  courseTitle: string;
  teacher: string;
  category: string;
  status: string;
  totalEnrollments: number;
  uniqueStudents: number;
  completionRate: number;
  certificatesEarned: number;
  avgRating: number;
  totalRatings: number;
}

interface CategoryPerformance {
  category: string;
  courseCount: number;
  totalEnrollments: number;
  totalRevenue: number;
  avgRating: number;
}

export default function CourseAnalyticsPage() {
  const [performance, setPerformance] = useState<CoursePerformance[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfRes, catRes] = await Promise.all([
        fetch("/api/superadmin/courses/performance"),
        fetch("/api/superadmin/courses/category-performance"),
      ]);
      const perfData = await perfRes.json();
      const catData = await catRes.json();
      setPerformance(perfData);
      setCategoryPerformance(catData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Performance Analytics</h1>
        <p className="text-muted-foreground">
          Analyze course performance, enrollments, and completion rates
        </p>
      </div>

      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Course Performance</TabsTrigger>
          <TabsTrigger value="categories">Category Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Courses Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each course
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
                      <TableHead>Course</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead>Certificates</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map((course) => (
                      <TableRow key={course.courseId}>
                        <TableCell className="font-medium">
                          {course.courseTitle}
                        </TableCell>
                        <TableCell>{course.teacher}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.category}</Badge>
                        </TableCell>
                        <TableCell>{course.totalEnrollments}</TableCell>
                        <TableCell>{course.completionRate}%</TableCell>
                        <TableCell>{course.certificatesEarned}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{course.avgRating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-muted-foreground">
                              ({course.totalRatings})
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.status === "Published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Performance metrics by course category
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
                      <TableHead>Category</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Enrollments</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Avg Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryPerformance.map((cat) => (
                      <TableRow key={cat.category}>
                        <TableCell className="font-medium">
                          {cat.category}
                        </TableCell>
                        <TableCell>{cat.courseCount}</TableCell>
                        <TableCell>{cat.totalEnrollments}</TableCell>
                        <TableCell className="font-semibold">
                          ${(cat.totalRevenue / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span>{cat.avgRating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
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
