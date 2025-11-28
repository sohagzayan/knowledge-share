"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { gradeAssignment, markMissingAssignment } from "../actions";
import { toast } from "sonner";
import { Award, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface iAppProps {
  submissionId: string;
  studentName: string;
  assignmentTitle: string;
  lessonTitle: string;
  chapterTitle?: string;
  assignmentId?: string;
  userId?: string;
  isMissing?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignmentReviewModal({
  submissionId,
  studentName,
  assignmentTitle,
  lessonTitle,
  chapterTitle,
  assignmentId,
  userId,
  isMissing,
  onClose,
  onSuccess,
}: iAppProps) {
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<"Graded" | "Returned">("Graded");
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!grade || isNaN(Number(grade)) || Number(grade) < 0) {
      toast.error("Please enter a valid grade");
      return;
    }

    startTransition(async () => {
      try {
        let result;
        if (isMissing && assignmentId && userId) {
          // Mark missing assignment
          result = await markMissingAssignment({
            assignmentId,
            userId,
            grade: Number(grade),
            feedback: feedback.trim() || undefined,
            status,
          });
        } else {
          // Grade existing submission
          result = await gradeAssignment({
            submissionId,
            grade: Number(grade),
            feedback: feedback.trim() || undefined,
            status,
          });
        }

        if (result.status === "success") {
          toast.success(result.message);
          onSuccess();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to grade assignment. Please try again.");
      }
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isMissing ? "Mark Missing Assignment" : "Review Assignment"}
          </DialogTitle>
          <DialogDescription>
            {isMissing
              ? `Mark and grade ${studentName}'s missing assignment`
              : `Grade and provide feedback for ${studentName}'s submission`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Assignment</Label>
            <p className="text-sm">{assignmentTitle}</p>
            {chapterTitle && (
              <p className="text-xs text-muted-foreground">Chapter: {chapterTitle}</p>
            )}
            <p className="text-xs text-muted-foreground">Lesson: {lessonTitle}</p>
            {isMissing && (
              <Badge variant="outline" className="bg-amber-500/20 text-amber-600 border-amber-500/50 mt-2">
                Not Submitted
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-semibold">
              Grade <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="grade"
                type="number"
                min="0"
                max="1000"
                placeholder="Enter grade (0-1000)"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-32"
              />
              <Badge variant="outline" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                Points (Max: 1000)
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Enter 0 if assignment is missing or not submitted properly
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-semibold">
              Status
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={status === "Graded" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus("Graded")}
              >
                <Award className="h-4 w-4 mr-2" />
                Graded
              </Button>
              <Button
                type="button"
                variant={status === "Returned" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus("Returned")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Returned (Needs Revision)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {status === "Graded"
                ? "Mark as completed and graded"
                : "Return to student for revision"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-semibold">
              Feedback (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Provide feedback to the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">
              {feedback.length} / 2000 characters
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
              <Button onClick={handleSubmit} disabled={pending || !grade}>
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  {isMissing ? "Mark & Grade" : "Save Grade"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

