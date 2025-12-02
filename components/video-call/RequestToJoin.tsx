"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Video, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestToJoinProps {
  supportCallId: string;
  streamCallId: string;
  onRequestSubmitted?: () => void;
  existingRequest?: {
    id: string;
    status: string;
    supportType: string;
  } | null;
}

export function RequestToJoin({
  supportCallId,
  streamCallId,
  onRequestSubmitted,
  existingRequest,
}: RequestToJoinProps) {
  const [supportType, setSupportType] = useState(
    existingRequest?.supportType || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!supportType.trim()) {
      toast.error("Please describe what kind of support you need");
      return;
    }

    if (!supportCallId) {
      toast.error("Support session ID is missing");
      console.error("supportCallId is undefined");
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        supportType: supportType.trim(),
      };
      
      console.log("Submitting request:", { supportCallId, requestBody });
      
      const response = await fetch(`/api/support-calls/${supportCallId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = "Failed to submit request";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      toast.success("Request submitted! Waiting for approval...");
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (error: any) {
      console.error("Error submitting request:", error);
      const errorMessage = error?.message || error?.toString() || "Failed to submit request";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingRequest) {
    if (existingRequest.status === "Accepted") {
      // This shouldn't happen as the user should be able to join directly
      // But if it does, redirect them to join
      return (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-green-500" />
                Request Accepted
              </CardTitle>
              <CardDescription>
                Your request has been accepted! You can now join the session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please refresh the page to join the session.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (existingRequest.status === "Pending") {
      return (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Request Pending
              </CardTitle>
              <CardDescription>
                Your request to join this support session is pending approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The session creator will review your request and notify you
                  when it's approved.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Your Request:</Label>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  {existingRequest.supportType}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (existingRequest.status === "Rejected") {
      return (
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Request Rejected
              </CardTitle>
              <CardDescription>
                Your request to join this support session was rejected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your request was not approved. You can submit a new request if
                  needed.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label>Your Previous Request:</Label>
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  {existingRequest.supportType}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportType">
                  New Request (Optional)
                </Label>
                <Textarea
                  id="supportType"
                  placeholder="Describe what kind of support you need..."
                  value={supportType}
                  onChange={(e) => setSupportType(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !supportType.trim()}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit New Request"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Request to Join Support Session
          </CardTitle>
          <CardDescription>
            Please describe what kind of support you need to join this session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supportType">
              What do you need help with? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="supportType"
              placeholder="e.g., I'm stuck on lesson 5 and need help understanding the concept..."
              value={supportType}
              onChange={(e) => setSupportType(e.target.value)}
              rows={4}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !supportType.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            The session creator will review your request and approve it if
            appropriate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

