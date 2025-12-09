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

interface ActiveStudent {
  userId: string;
  studentName: string;
  lessonsCompleted: number;
  coursesCompleted: number;
  hoursStudied: number;
}

interface MostActiveStudentsTableProps {
  students: ActiveStudent[];
}

export function MostActiveStudentsTable({
  students,
}: MostActiveStudentsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Active Students</CardTitle>
        <CardDescription>
          Top students by lessons completed and learning hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead className="text-right">Lessons Completed</TableHead>
              <TableHead className="text-right">Courses Completed</TableHead>
              <TableHead className="text-right">Hours Studied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student, index) => (
                <TableRow key={student.userId}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell className="font-medium">{student.studentName}</TableCell>
                  <TableCell className="text-right">
                    {student.lessonsCompleted}
                  </TableCell>
                  <TableCell className="text-right">
                    {student.coursesCompleted}
                  </TableCell>
                  <TableCell className="text-right">
                    {student.hoursStudied}h
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

