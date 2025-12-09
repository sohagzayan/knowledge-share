"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TopCourse {
  id: string;
  courseName: string;
  teacher: string;
  totalEnrollments: number;
  completionRate: number;
  revenueEarned: number;
  ratings: number;
}

interface TopCoursesTableProps {
  courses: TopCourse[];
}

export function TopCoursesTable({ courses }: TopCoursesTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount / 100); // Assuming amount is in cents
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Courses</CardTitle>
        <CardDescription>
          Courses ranked by total enrollments and revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-right">Enrollments</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
              <TableHead className="text-right">Ratings</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No courses found
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.courseName}</TableCell>
                  <TableCell>{course.teacher}</TableCell>
                  <TableCell className="text-right">{course.totalEnrollments}</TableCell>
                  <TableCell className="text-right">
                    {course.completionRate}%
                  </TableCell>
                  <TableCell className="text-right">
                    {course.ratings.toFixed(1)} ⭐
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(course.revenueEarned)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

