"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "@/lib/date-utils";
import { IconCheck, IconClock, IconX, IconMessageCircle, IconEye, IconSend, IconAlertCircle } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { submitUserReply } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface HelpRequest {
  id: string;
  subject: string;
  message: string;
  userType: "Teacher" | "Student" | "Admin";
  status: "Pending" | "InProgress" | "Resolved" | "Closed";
  response: string | null;
  respondedAt: Date | null;
  userReply: string | null;
  userRepliedAt: Date | null;
  createdAt: Date;
}

interface HelpRequestsListProps {
  initialRequests: HelpRequest[];
}

const statusConfig = {
  Pending: {
    label: "Pending",
    variant: "secondary" as const,
    icon: IconClock,
    color: "text-yellow-600",
  },
  InProgress: {
    label: "In Progress",
    variant: "default" as const,
    icon: IconMessageCircle,
    color: "text-blue-600",
  },
  Resolved: {
    label: "Resolved",
    variant: "default" as const,
    icon: IconCheck,
    color: "text-green-600",
  },
  Closed: {
    label: "Closed",
    variant: "outline" as const,
    icon: IconX,
    color: "text-gray-600",
  },
};

export function HelpRequestsList({ initialRequests }: HelpRequestsListProps) {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, startTransition] = useTransition();

  const handleViewRequest = (request: HelpRequest) => {
    setSelectedRequest(request);
    setReplyText("");
    setIsDialogOpen(true);
  };

  const handleSubmitReply = () => {
    if (!selectedRequest || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    if (replyText.trim().length < 10) {
      toast.error("Reply must be at least 10 characters");
      return;
    }

    startTransition(async () => {
      const result = await submitUserReply({
        requestId: selectedRequest.id,
        reply: replyText.trim(),
      });

      if (result.status === "success") {
        toast.success(result.message);
        setReplyText("");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  };

  // Check if request needs user response (has response but no user reply yet)
  const needsUserResponse = (request: HelpRequest) => {
    return request.response && !request.userReply && request.status !== "Closed";
  };

  if (initialRequests.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconMessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No help requests yet</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            You haven't submitted any help requests. Submit one from the Get Help page.
          </p>
          <Button asChild>
            <a href="/dashboard/get-help">Submit a Help Request</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {initialRequests.map((request) => {
          const statusInfo = statusConfig[request.status];
          const StatusIcon = statusInfo.icon;

          const needsResponse = needsUserResponse(request);

          return (
            <Card 
              key={request.id} 
              className={`hover:shadow-md transition-shadow ${
                needsResponse ? "border-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{request.subject}</CardTitle>
                      {needsResponse && (
                        <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 flex items-center gap-1">
                          <IconAlertCircle className="h-3 w-3" />
                          Response Needed
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2 mb-3">
                      {request.message}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Submitted {formatDistanceToNow(new Date(request.createdAt))} ago
                      </span>
                      {request.respondedAt && (
                        <span>
                          • Responded {formatDistanceToNow(new Date(request.respondedAt))} ago
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                    <Button
                      variant={needsResponse ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleViewRequest(request)}
                    >
                      <IconEye className="h-4 w-4 mr-2" />
                      {needsResponse ? "View & Reply" : "View Details"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.subject}</DialogTitle>
            <DialogDescription>
              Help request details and response
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-2">Your Message</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedRequest.message}
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <Badge variant={statusConfig[selectedRequest.status].variant}>
                    {statusConfig[selectedRequest.status].label}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted: </span>
                  <span>{formatDistanceToNow(new Date(selectedRequest.createdAt))} ago</span>
                </div>
              </div>

              {selectedRequest.response ? (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <IconMessageCircle className="h-4 w-4" />
                      Response from Support
                    </h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedRequest.response}
                      </p>
                    </div>
                    {selectedRequest.respondedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded {formatDistanceToNow(new Date(selectedRequest.respondedAt))} ago
                      </p>
                    )}
                  </div>

                  {selectedRequest.userReply ? (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <IconSend className="h-4 w-4" />
                          Your Reply
                        </h4>
                        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                          <p className="text-sm whitespace-pre-wrap">
                            {selectedRequest.userReply}
                          </p>
                        </div>
                        {selectedRequest.userRepliedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            You replied {formatDistanceToNow(new Date(selectedRequest.userRepliedAt))} ago
                          </p>
                        )}
                      </div>
                    </>
                  ) : selectedRequest.status !== "Closed" && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="reply" className="text-sm font-semibold flex items-center gap-2">
                            <IconAlertCircle className="h-4 w-4 text-orange-500" />
                            Reply to Support
                          </Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            The support team is waiting for your response. Please provide the information they requested.
                          </p>
                          <Textarea
                            id="reply"
                            placeholder="Type your reply here... Provide the details or information the support team requested."
                            className="min-h-[120px] resize-none"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Separator />
                  <div className="bg-muted/30 rounded-lg p-4 text-center">
                    <IconClock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No response yet. Our support team will get back to you soon.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedRequest?.response && !selectedRequest.userReply && selectedRequest.status !== "Closed" && (
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !replyText.trim() || replyText.trim().length < 10}
              >
                {isSubmitting ? (
                  <>
                    <IconClock className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <IconSend className="h-4 w-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
