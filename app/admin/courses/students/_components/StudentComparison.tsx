"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GitCompare, Trophy, Target, Activity, FileCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";

interface Student {
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
  assignmentStats?: {
    submitted: number;
    late: number;
    pending: number;
    total: number;
  };
}

interface StudentComparisonProps {
  students: Student[];
  courseId: string;
}

export function StudentComparison({ students, courseId }: StudentComparisonProps) {
  const [open, setOpen] = useState(false);
  const [student1Id, setStudent1Id] = useState<string>("");
  const [student2Id, setStudent2Id] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    student1: Student | null;
    student2: Student | null;
  }>({ student1: null, student2: null });
  const [pending, startTransition] = useTransition();

  const handleCompare = () => {
    if (!student1Id || !student2Id || student1Id === student2Id) {
      return;
    }

    setLoading(true);
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/courses/${courseId}/students/compare?student1=${student1Id}&student2=${student2Id}`
        );
        if (response.ok) {
          const data = await response.json();
          setComparisonData(data);
        }
      } catch (error) {
        console.error("Failed to compare students:", error);
      } finally {
        setLoading(false);
      }
    });
  };

  const student1 = students.find((s) => s.id === student1Id);
  const student2 = students.find((s) => s.id === student2Id);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-7 text-xs"
      >
        <GitCompare className="h-3 w-3 mr-1" />
        Compare Students
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Compare Students</DialogTitle>
            <DialogDescription>
              Select two students to compare their progress, points, and activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Student 1</label>
                <Select value={student1Id} onValueChange={setStudent1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Student 2</label>
                <Select value={student2Id} onValueChange={setStudent2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleCompare}
              disabled={!student1Id || !student2Id || student1Id === student2Id || loading}
              className="w-full"
            >
              Compare
            </Button>

            {comparisonData.student1 && comparisonData.student2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4 mt-6"
              >
                {/* Student 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={comparisonData.student1.image || undefined} />
                      <AvatarFallback>
                        {comparisonData.student1.firstName[0]}
                        {comparisonData.student1.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {comparisonData.student1.firstName} {comparisonData.student1.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {comparisonData.student1.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Progress
                        </span>
                        <span className="text-sm">
                          {comparisonData.student1.progress.completedLessons}/
                          {comparisonData.student1.progress.totalLessons}
                        </span>
                      </div>
                      <Progress value={comparisonData.student1.progress.percentage} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Points
                      </span>
                      <span className="text-sm font-semibold">
                        {comparisonData.student1.totalPoints}
                      </span>
                    </div>

                    {comparisonData.student1.assignmentStats && (
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <FileCheck className="h-4 w-4" />
                          <span className="text-sm font-medium">Assignments</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div>
                            Submitted: {comparisonData.student1.assignmentStats.submitted}/
                            {comparisonData.student1.assignmentStats.total}
                          </div>
                          <div>Late: {comparisonData.student1.assignmentStats.late}</div>
                          <div>Pending: {comparisonData.student1.assignmentStats.pending}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={comparisonData.student2.image || undefined} />
                      <AvatarFallback>
                        {comparisonData.student2.firstName[0]}
                        {comparisonData.student2.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">
                        {comparisonData.student2.firstName} {comparisonData.student2.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {comparisonData.student2.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          Progress
                        </span>
                        <span className="text-sm">
                          {comparisonData.student2.progress.completedLessons}/
                          {comparisonData.student2.progress.totalLessons}
                        </span>
                      </div>
                      <Progress value={comparisonData.student2.progress.percentage} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Points
                      </span>
                      <span className="text-sm font-semibold">
                        {comparisonData.student2.totalPoints}
                      </span>
                    </div>

                    {comparisonData.student2.assignmentStats && (
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <FileCheck className="h-4 w-4" />
                          <span className="text-sm font-medium">Assignments</span>
                        </div>
                        <div className="text-xs space-y-1">
                          <div>
                            Submitted: {comparisonData.student2.assignmentStats.submitted}/
                            {comparisonData.student2.assignmentStats.total}
                          </div>
                          <div>Late: {comparisonData.student2.assignmentStats.late}</div>
                          <div>Pending: {comparisonData.student2.assignmentStats.pending}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

