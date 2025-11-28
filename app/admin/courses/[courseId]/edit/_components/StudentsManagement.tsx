"use client";

import { useState } from "react";
import { CourseStudentType } from "@/app/data/admin/admin-get-course-students";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Download,
  Link2,
} from "lucide-react";
import { useConstructUrl as constructUrl } from "@/hooks/use-construct-url";
import { motion } from "framer-motion";
import { AssignmentReviewModal } from "./AssignmentReviewModal";

interface iAppProps {
  courseId: string;
  initialStudents: CourseStudentType[];
}

export function StudentsManagement({ courseId, initialStudents }: iAppProps) {
  const [students, setStudents] = useState<CourseStudentType[]>(initialStudents);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [selectedSubmission, setSelectedSubmission] = useState<{
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    lessonTitle: string;
    chapterTitle?: string;
    assignmentId?: string;
    userId?: string;
    isMissing?: boolean;
  } | null>(null);

  const toggleStudent = (enrollmentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(enrollmentId)) {
      newExpanded.delete(enrollmentId);
    } else {
      newExpanded.add(enrollmentId);
    }
    setExpandedStudents(newExpanded);
  };

  const handleRefresh = async () => {
    const response = await fetch(`/api/admin/courses/${courseId}/students`);
    if (response.ok) {
      const data = await response.json();
      setStudents(data);
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
        <p className="text-sm text-muted-foreground">
          This course doesn't have any enrolled students yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Enrolled Students</h3>
          <p className="text-sm text-muted-foreground">
            {students.length} {students.length === 1 ? "student" : "students"} enrolled
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {students.map((student, index) => {
          const isExpanded = expandedStudents.has(student.enrollmentId);
          const hasAssignments = student.assignments.length > 0;
          const pendingAssignments = student.assignments.filter(
            (a) => a.submission && a.submission.status === "Pending"
          ).length;
          const gradedAssignments = student.assignments.filter(
            (a) => a.submission && a.submission.status === "Graded"
          ).length;

          return (
            <motion.div
              key={student.enrollmentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Collapsible
                open={isExpanded}
                onOpenChange={() => toggleStudent(student.enrollmentId)}
              >
                <div className="border rounded-lg bg-card">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={
                              student.user.image
                                ? constructUrl(student.user.image)
                                : undefined
                            }
                            alt={student.user.firstName}
                          />
                          <AvatarFallback>
                            {student.user.firstName?.[0] || "U"}
                            {student.user.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">
                              {student.user.firstName} {student.user.lastName}
                            </h4>
                            {student.user.username && (
                              <Badge variant="outline" className="text-xs">
                                @{student.user.username}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {student.user.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {student.progress.completedLessons} / {student.progress.totalLessons}
                            </div>
                            <div className="text-xs text-muted-foreground">Lessons</div>
                          </div>
                          <div className="w-24">
                            <Progress value={student.progress.percentage} className="h-2" />
                            <div className="text-xs text-muted-foreground mt-1 text-center">
                              {student.progress.percentage}%
                            </div>
                          </div>
                          {hasAssignments && (
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {pendingAssignments > 0 && (
                                    <Badge variant="outline" className="ml-2 bg-amber-500/20 text-amber-600 border-amber-500/50">
                                      {pendingAssignments} Pending
                                    </Badge>
                                  )}
                                  {gradedAssignments > 0 && (
                                    <Badge variant="outline" className="ml-2 bg-green-500/20 text-green-600 border-green-500/50">
                                      {gradedAssignments} Graded
                                    </Badge>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t p-4 space-y-4">
                      {/* Progress Details */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Course Progress</h5>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Progress value={student.progress.percentage} className="h-3" />
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.progress.completedLessons} of {student.progress.totalLessons} lessons completed
                          </div>
                        </div>
                      </div>

                      {/* Assignments */}
                      {hasAssignments ? (
                        <div>
                          <h5 className="text-sm font-semibold mb-3">Assignment Submissions</h5>
                          <div className="space-y-4">
                            {Object.entries(
                              student.assignments.reduce((acc, assignment) => {
                                if (!acc[assignment.chapterId]) {
                                  acc[assignment.chapterId] = {
                                    chapterTitle: assignment.chapterTitle,
                                    chapterPosition: assignment.chapterPosition,
                                    assignments: [],
                                  };
                                }
                                acc[assignment.chapterId].assignments.push(assignment);
                                return acc;
                              }, {} as Record<string, { chapterTitle: string; chapterPosition: number; assignments: typeof student.assignments }>)
                            )
                              .sort(([, a], [, b]) => a.chapterPosition - b.chapterPosition)
                              .map(([chapterId, chapterData]) => (
                                <div key={chapterId} className="border rounded-lg p-3 bg-background/50">
                                  <h6 className="font-semibold text-sm mb-2 text-primary">
                                    Chapter: {chapterData.chapterTitle}
                                  </h6>
                                  <div className="space-y-2">
                                    {chapterData.assignments
                                      .sort((a, b) => a.lessonPosition - b.lessonPosition)
                                      .map((assignment) => (
                                        <div
                                          key={assignment.assignmentId}
                                          className="border rounded-lg p-3 bg-muted/30 ml-4"
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                              <h6 className="font-medium text-sm">{assignment.assignmentTitle}</h6>
                                              <p className="text-xs text-muted-foreground">
                                                Lesson: {assignment.lessonTitle}
                                              </p>
                                            </div>
                                  {assignment.submission ? (
                                    <Badge
                                      variant="outline"
                                      className={
                                        assignment.submission.status === "Graded"
                                          ? "bg-green-500/20 text-green-600 border-green-500/50"
                                          : assignment.submission.status === "Returned"
                                            ? "bg-blue-500/20 text-blue-600 border-blue-500/50"
                                            : "bg-amber-500/20 text-amber-600 border-amber-500/50"
                                      }
                                    >
                                      {assignment.submission.status === "Graded" ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                      ) : assignment.submission.status === "Returned" ? (
                                        <FileText className="h-3 w-3 mr-1" />
                                      ) : (
                                        <Clock className="h-3 w-3 mr-1" />
                                      )}
                                      {assignment.submission.status}
                                    </Badge>
                                          ) : (
                                            <Badge variant="outline" className="bg-gray-500/20 text-gray-600">
                                              Not Submitted
                                            </Badge>
                                          )}
                                        </div>

                                        {assignment.submission ? (
                                  <div className="mt-3 space-y-2">
                                    <div className="text-xs text-muted-foreground">
                                      Submitted:{" "}
                                      {new Date(assignment.submission.submittedAt).toLocaleDateString()}
                                      {assignment.submission.submissionCount > 1 && (
                                        <span className="ml-2">
                                          • Submission #{assignment.submission.submissionCount}
                                        </span>
                                      )}
                                    </div>

                                    {assignment.submission.fileKey && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                          window.open(
                                            constructUrl(assignment.submission!.fileKey!),
                                            "_blank"
                                          );
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-2" />
                                        Download File
                                      </Button>
                                    )}

                                    {assignment.submission.link && (
                                      <div>
                                        <a
                                          href={assignment.submission.link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-primary hover:underline flex items-center gap-1"
                                        >
                                          <Link2 className="h-3 w-3" />
                                          View Submission Link
                                        </a>
                                      </div>
                                    )}

                                    {assignment.submission.description && (
                                      <div className="text-xs bg-background p-2 rounded border">
                                        <p className="font-medium mb-1">Description:</p>
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                          {assignment.submission.description}
                                        </p>
                                      </div>
                                    )}

                                    {assignment.submission.grade !== null && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Award className="h-4 w-4 text-primary" />
                                        <span className="text-muted-foreground">Grade:</span>
                                        <span className="font-semibold">
                                          {assignment.submission.grade} / {assignment.assignmentPoints}
                                        </span>
                                      </div>
                                    )}

                                    {assignment.submission.feedback && (
                                      <div className="text-xs bg-muted/50 p-2 rounded">
                                        <p className="font-medium mb-1">Feedback:</p>
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                          {assignment.submission.feedback}
                                        </p>
                                      </div>
                                    )}

                                          <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full sm:w-auto mt-2"
                                            onClick={() => {
                                              setSelectedSubmission({
                                                submissionId: assignment.submission!.id,
                                                studentName: `${student.user.firstName} ${student.user.lastName}`,
                                                assignmentTitle: assignment.assignmentTitle,
                                                lessonTitle: assignment.lessonTitle,
                                                chapterTitle: assignment.chapterTitle,
                                              });
                                            }}
                                          >
                                            <FileText className="h-3 w-3 mr-2" />
                                            {assignment.submission.status === "Pending"
                                              ? "Review & Grade"
                                              : "Update Grade"}
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="mt-3">
                                          <p className="text-xs text-muted-foreground mb-2">
                                            Student has not submitted this assignment.
                                          </p>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={() => {
                                              setSelectedSubmission({
                                                submissionId: "",
                                                studentName: `${student.user.firstName} ${student.user.lastName}`,
                                                assignmentTitle: assignment.assignmentTitle,
                                                lessonTitle: assignment.lessonTitle,
                                                chapterTitle: assignment.chapterTitle,
                                                assignmentId: assignment.assignmentId,
                                                userId: student.user.id,
                                                isMissing: true,
                                              });
                                            }}
                                          >
                                            <FileText className="h-3 w-3 mr-2" />
                                            Mark as Missing/Not Submitted
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No assignments in this course yet.
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>

      {selectedSubmission && (
        <AssignmentReviewModal
          submissionId={selectedSubmission.submissionId}
          studentName={selectedSubmission.studentName}
          assignmentTitle={selectedSubmission.assignmentTitle}
          lessonTitle={selectedSubmission.lessonTitle}
          chapterTitle={selectedSubmission.chapterTitle}
          assignmentId={selectedSubmission.assignmentId}
          userId={selectedSubmission.userId}
          isMissing={selectedSubmission.isMissing}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={() => {
            // Refresh students data
            handleRefresh();
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  );
}

