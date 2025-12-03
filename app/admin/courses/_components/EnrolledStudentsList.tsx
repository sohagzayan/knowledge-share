"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronDown, ChevronUp, User } from "lucide-react";
import { useConstructUrl } from "@/hooks/use-construct-url";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Student {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  image: string | null;
  username: string | null;
  enrolledAt: Date;
}

interface StudentsPreviewData {
  totalCount: number;
  students: Student[];
}

interface EnrolledStudentsListProps {
  courseId: string;
}

export function EnrolledStudentsList({ courseId }: EnrolledStudentsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudentsPreviewData | null>(null);
  const constructUrl = useConstructUrl;

  useEffect(() => {
    if (isExpanded && !data) {
      setLoading(true);
      fetch(`/api/admin/courses/${courseId}/students-preview`)
        .then((res) => res.json())
        .then((result: StudentsPreviewData) => {
          setData(result);
        })
        .catch((error) => {
          console.error("Failed to fetch students:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isExpanded, courseId, data]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getInitials = (firstName: string, lastName: string | null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ""}`.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="border-t border-border/50 pt-4 mt-4">
      <button
        onClick={toggleExpand}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 group/header"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/header:bg-primary/15 transition-colors duration-200">
            <Users className="size-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              Enrolled Students
            </p>
            <p className="text-xs text-muted-foreground">
              {data?.totalCount ?? "..."} {data?.totalCount === 1 ? "student" : "students"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && data.totalCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {data.students.length} of {data.totalCount}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="size-4 text-muted-foreground group-hover/header:text-foreground transition-colors duration-200" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground group-hover/header:text-foreground transition-colors duration-200" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-2">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data && data.students.length > 0 ? (
                <>
                  {data.students.map((student, index) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors duration-200 group/student"
                    >
                      <Avatar className="size-10 ring-2 ring-border group-hover/student:ring-primary/50 transition-all duration-200">
                        <AvatarImage
                          src={student.image ? constructUrl(student.image) : undefined}
                          alt={`${student.firstName} ${student.lastName || ""}`}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {student.firstName} {student.lastName || ""}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {student.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(student.enrolledAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {data.totalCount > data.students.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: data.students.length * 0.05 + 0.1 }}
                      className="pt-2"
                    >
                      <Link
                        href={`/admin/courses/students?courseId=${courseId}`}
                        className="block"
                      >
                        <Button
                          variant="outline"
                          className="w-full text-sm group/view-all"
                        >
                          View All {data.totalCount} Students
                          <ChevronDown className="size-4 ml-2 group-hover/view-all:translate-y-1 transition-transform duration-200" />
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <User className="size-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No students enrolled yet</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}