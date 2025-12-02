"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSupportCalls } from "@/hooks/use-support-calls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Video, Plus, Users, Check, XCircle, ChevronDown, ChevronUp, RefreshCw, Loader2, PhoneOff, LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SupportCall {
  id: string;
  title: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  endedAt: Date | null;
  streamCallId: string | null;
  Creator: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  };
  requests: Array<{
    id: string;
    supportType: string;
    status: string;
    position: number;
    User: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
    };
  }>;
}

interface SupportSessionsViewProps {
  courseId: string;
}

export function SupportSessionsView({ courseId }: SupportSessionsViewProps) {
  const [supportCalls, setSupportCalls] = useState<SupportCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingActions, setLoadingActions] = useState<{
    [key: string]: "accept" | "reject" | "end" | "join" | null;
  }>({});
  const { createSupportSession, joinSupportSession, isLoading: isCreating, isClientReady } =
    useSupportCalls();

  const fetchSupportCalls = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetch(`/api/support-calls?courseId=${courseId}`, {
        cache: "no-store", // Ensure fresh data
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched support calls:", data);
        console.log("Total calls:", data.length);
        data.forEach((call: SupportCall) => {
          console.log(`Call ${call.id}: ${call.requests.length} requests`);
          call.requests.forEach((req) => {
            console.log(`  - Request ${req.id}: ${req.status} by ${req.User.email}`);
          });
        });
        setSupportCalls(data);
      } else {
        console.error("Failed to fetch support calls:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching support calls:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchSupportCalls();
    
    // Auto-refresh every 5 seconds to show new requests
    const interval = setInterval(() => {
      fetchSupportCalls();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchSupportCalls]);

  const handleCreateSession = async () => {
    try {
      const callId = await createSupportSession({
        courseId,
        title: title || undefined,
        description: description || undefined,
      });

      if (callId) {
        setIsDialogOpen(false);
        setTitle("");
        setDescription("");
        await fetchSupportCalls();
        joinSupportSession(callId);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleJoinSession = (streamCallId: string, callId: string) => {
    setLoadingActions((prev) => ({ ...prev, [callId]: "join" }));
    // Open in new tab
    window.open(`/call/${streamCallId}`, "_blank");
    // Reset loading after a short delay
    setTimeout(() => {
      setLoadingActions((prev) => ({ ...prev, [callId]: null }));
    }, 500);
  };

  const handleEndSession = async (callId: string, streamCallId: string) => {
    if (!confirm("Are you sure you want to end this support session? All participants will be disconnected.")) {
      return;
    }

    setLoadingActions((prev) => ({ ...prev, [callId]: "end" }));
    try {
      const response = await fetch(`/api/support-calls/${streamCallId}/end`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to end session");
      }

      toast.success("Session ended successfully");
      await fetchSupportCalls();
    } catch (error: any) {
      console.error("Error ending session:", error);
      toast.error(error.message || "Failed to end session");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [callId]: null }));
    }
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: "Accepted" | "Rejected",
    callId: string
  ) => {
    setLoadingActions((prev) => ({ ...prev, [requestId]: status.toLowerCase() as "accept" | "reject" }));
    try {
      const response = await fetch(
        `/api/support-calls/request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update request");
      }

      toast.success(`Request ${status.toLowerCase()} successfully`);
      await fetchSupportCalls();
    } catch (error: any) {
      console.error("Error updating request:", error);
      toast.error(error.message || "Failed to update request");
    } finally {
      setLoadingActions((prev) => ({ ...prev, [requestId]: null }));
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading support sessions...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Support Sessions</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage video support sessions for students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchSupportCalls(true)}
            disabled={isRefreshing}
            className="transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 transition-transform ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="transition-all duration-200 hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Session</DialogTitle>
              <DialogDescription>
                Start a new video support session for students to join
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!isClientReady && (
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Initializing video client... Please wait a moment.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Office Hours - Week 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this session is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSession} 
                disabled={isCreating || !isClientReady}
                className="transition-all duration-200 hover:scale-105 disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : !isClientReady ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Create & Join"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {supportCalls.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No support sessions yet</p>
              <p className="text-sm mt-2">
                Create your first session to start helping students
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Manage your support sessions and view student requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supportCalls.map((call) => {
                  const pendingRequests = call.requests.filter(
                    (r) => r.status === "Pending"
                  );
                  const activeRequests = call.requests.filter(
                    (r) => r.status === "Accepted" || r.status === "Pending"
                  );
                  const isExpanded = expandedCallId === call.id;
                  const isLoadingJoin = loadingActions[call.id] === "join";
                  const isLoadingEnd = loadingActions[call.id] === "end";

                  return (
                    <React.Fragment key={call.id}>
                      <TableRow>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {call.title || "Support Session"}
                            </div>
                            {call.description && (
                              <div className="text-sm text-muted-foreground">
                                {call.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              call.status === "Active"
                                ? "default"
                                : call.status === "Ended"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {call.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(call.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(call.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="flex items-center gap-2">
                              <span className="font-medium">{activeRequests.length}</span>
                              {pendingRequests.length > 0 && (
                                <Badge variant="destructive" className="animate-pulse text-xs">
                                  {pendingRequests.length} pending
                                </Badge>
                              )}
                              {call.requests.length > activeRequests.length && (
                                <Badge variant="outline" className="text-xs">
                                  {call.requests.length - activeRequests.length} completed
                                </Badge>
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {call.status === "Active" && call.streamCallId && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleJoinSession(call.streamCallId!, call.id)}
                                  disabled={isLoadingJoin || isLoadingEnd}
                                  className="transition-all duration-200 hover:scale-105"
                                >
                                  {isLoadingJoin ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Opening...
                                    </>
                                  ) : (
                                    <>
                                      <Video className="h-4 w-4 mr-2" />
                                      Join
                                    </>
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleEndSession(call.id, call.streamCallId!)}
                                  disabled={isLoadingJoin || isLoadingEnd}
                                  className="transition-all duration-200 hover:scale-105"
                                >
                                  {isLoadingEnd ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Ending...
                                    </>
                                  ) : (
                                    <>
                                      <PhoneOff className="h-4 w-4 mr-2" />
                                      End Session
                                    </>
                                  )}
                                </Button>
                              </>
                            )}
                            {call.requests.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setExpandedCallId(
                                    isExpanded ? null : call.id
                                  )
                                }
                                className="transition-all duration-200"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && call.requests.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/50">
                            <div className="py-4 space-y-3">
                              <h4 className="font-semibold mb-3">
                                Join Requests ({call.requests.length})
                              </h4>
                              <div className="space-y-2">
                                {call.requests.map((request) => (
                                  <div
                                    key={request.id}
                                    className="flex items-start justify-between p-3 bg-background rounded-lg border transition-all duration-200 hover:shadow-md hover:border-primary/50"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">
                                          {request.User.firstName}{" "}
                                          {request.User.lastName}
                                        </span>
                                        <Badge
                                          variant={
                                            request.status === "Accepted"
                                              ? "default"
                                              : request.status === "Rejected"
                                              ? "destructive"
                                              : request.status === "Completed"
                                              ? "secondary"
                                              : "secondary"
                                          }
                                          className="transition-all duration-200"
                                        >
                                          {request.status}
                                        </Badge>
                                        {request.status === "Pending" && (
                                          <Badge variant="outline" className="text-xs">
                                            Position: {request.position}
                                          </Badge>
                                        )}
                                        {request.status === "Completed" && (
                                          <Badge variant="outline" className="text-xs">
                                            <LogOut className="h-3 w-3 mr-1" />
                                            Left
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-1">
                                        {request.User.email}
                                      </p>
                                      <p className="text-sm">{request.supportType}</p>
                                    </div>
                                    {request.status === "Pending" &&
                                      call.status === "Active" && (
                                        <div className="flex items-center gap-2 ml-4">
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() =>
                                              handleUpdateRequestStatus(
                                                request.id,
                                                "Accepted",
                                                call.id
                                              )
                                            }
                                            disabled={loadingActions[request.id] !== null}
                                            className="transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                          >
                                            {loadingActions[request.id] === "accept" ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                Accepting...
                                              </>
                                            ) : (
                                              <>
                                                <Check className="h-4 w-4 mr-1" />
                                                Accept
                                              </>
                                            )}
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() =>
                                              handleUpdateRequestStatus(
                                                request.id,
                                                "Rejected",
                                                call.id
                                              )
                                            }
                                            disabled={loadingActions[request.id] !== null}
                                            className="transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                          >
                                            {loadingActions[request.id] === "reject" ? (
                                              <>
                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                Rejecting...
                                              </>
                                            ) : (
                                              <>
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Reject
                                              </>
                                            )}
                                          </Button>
                                        </div>
                                      )}
                                    {request.status === "Accepted" && call.status === "Active" && (
                                      <Badge variant="outline" className="ml-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                        <Video className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                                        <span className="text-green-700 dark:text-green-300">In Call</span>
                                      </Badge>
                                    )}
                                    {request.status === "Completed" && (
                                      <Badge variant="outline" className="ml-4 bg-gray-50 dark:bg-gray-900/20">
                                        <LogOut className="h-3 w-3 mr-1" />
                                        Left
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

