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

interface Teacher {
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  totalCourses: number;
  avgRatings: number;
  completionRate: number;
  totalRevenueEarned: number;
}

interface TeacherLeaderboardTableProps {
  teachers: Teacher[];
}

export function TeacherLeaderboardTable({
  teachers,
}: TeacherLeaderboardTableProps) {
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
        <CardTitle>Teacher Leaderboard</CardTitle>
        <CardDescription>
          Top teachers ranked by revenue and student engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Teacher Name</TableHead>
              <TableHead className="text-right">Total Students</TableHead>
              <TableHead className="text-right">Total Courses</TableHead>
              <TableHead className="text-right">Avg Ratings</TableHead>
              <TableHead className="text-right">Completion Rate</TableHead>
              <TableHead className="text-right">Total Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No teachers found
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher, index) => (
                <TableRow key={teacher.teacherId}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell className="font-medium">{teacher.teacherName}</TableCell>
                  <TableCell className="text-right">{teacher.totalStudents}</TableCell>
                  <TableCell className="text-right">{teacher.totalCourses}</TableCell>
                  <TableCell className="text-right">
                    {teacher.avgRatings.toFixed(1)} ⭐
                  </TableCell>
                  <TableCell className="text-right">
                    {teacher.completionRate}%
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(teacher.totalRevenueEarned)}
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

