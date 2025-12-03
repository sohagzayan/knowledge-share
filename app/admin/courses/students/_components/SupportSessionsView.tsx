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
import { Video, Plus, Users, Check, XCircle, ChevronDown, ChevronUp, RefreshCw, Loader2, PhoneOff, Phone } from "lucide-react";
import { toast } from "sonner";
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
    joinedAt: Date | null;
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
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [endingCallId, setEndingCallId] = useState<string | null>(null);
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

  const handleJoinSession = (streamCallId: string) => {
    // Open in new tab
    window.open(`/call/${streamCallId}`, "_blank");
  };

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: "Accepted" | "Rejected"
  ) => {
    setLoadingStates((prev) => ({ ...prev, [requestId]: true }));
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
      setLoadingStates((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleEndSession = async (supportCallId: string, streamCallId: string) => {
    if (!confirm("Are you sure you want to end this support session? All participants will be disconnected.")) {
      return;
    }

    setEndingCallId(supportCallId);
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
      setEndingCallId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Loading support sessions...</p>
        <p className="text-sm text-muted-foreground mt-2">Please wait while we fetch your sessions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)]"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
              Support Sessions
            </h3>
            <p className="text-sm text-muted-foreground">
              Create and manage video support sessions for students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSupportCalls(true)}
              disabled={isRefreshing}
              className="backdrop-blur-sm bg-background/80 border-primary/30 hover:bg-primary/10 transition-all duration-300 hover:scale-110 hover:shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Create Support Session
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Start a new video support session for students to join
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-5 py-4">
                  {!isClientReady && (
                    <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-2 border-yellow-200 dark:border-yellow-800 p-4 animate-pulse">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-600 dark:text-yellow-400" />
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Initializing video client... Please wait a moment.
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Title (Optional)</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Office Hours - Week 1"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this session is about..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateSession} 
                    disabled={isCreating || !isClientReady}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
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
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create & Join
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {supportCalls.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16">
            <div className="text-center text-muted-foreground">
              <div className="relative inline-block mb-6">
                <Video className="h-16 w-16 mx-auto opacity-50 animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-ping"></div>
              </div>
              <p className="text-lg font-semibold mb-2">No support sessions yet</p>
              <p className="text-sm">
                Create your first session to start helping students
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Active Sessions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your support sessions and view student requests
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {/* Modern Card-Based Design */}
            {supportCalls.map((call, index) => {
              const pendingRequests = call.requests.filter(
                (r) => r.status === "Pending"
              );
              const activeParticipants = call.requests.filter(
                (r) => r.status === "Accepted" && r.joinedAt
              );
              const isExpanded = expandedCallId === call.id;
              const isEnding = endingCallId === call.id;

              return (
                <Card
                  key={call.id}
                  className={`group relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 ${
                    call.status === "Active"
                      ? "border-primary/30 bg-gradient-to-br from-background to-primary/5"
                      : "border-muted bg-muted/20"
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {/* Animated Background Gradient */}
                  {call.status === "Active" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Section - Session Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${
                            call.status === "Active"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground"
                          } transition-transform duration-300 group-hover:scale-110`}>
                            <Video className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                {call.title || "Support Session"}
                              </h3>
                              <Badge
                                variant={
                                  call.status === "Active"
                                    ? "default"
                                    : "secondary"
                                }
                                className={`${
                                  call.status === "Active"
                                    ? "bg-green-500 hover:bg-green-600 animate-pulse"
                                    : "bg-gray-500"
                                } text-white font-semibold px-3 py-1 shadow-lg transition-all duration-300 hover:scale-105`}
                              >
                                {call.status}
                              </Badge>
                            </div>
                            {call.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {call.description}
                              </p>
                            )}
                            
                            {/* Stats Row */}
                            <div className="flex items-center gap-6 flex-wrap">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="p-1.5 rounded-lg bg-muted">
                                  <Users className="h-4 w-4" />
                                </div>
                                <span className="font-semibold">{activeParticipants.length}</span>
                                <span className="text-muted-foreground">/ {call.requests.length}</span>
                                {activeParticipants.length > 0 && (
                                  <Badge variant="default" className="bg-green-500 ml-2 animate-pulse">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {activeParticipants.length} in call
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{new Date(call.createdAt).toLocaleTimeString()}</span>
                              </div>
                              {pendingRequests.length > 0 && (
                                <Badge variant="destructive" className="animate-pulse shadow-lg">
                                  {pendingRequests.length} pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center gap-2">
                        {call.status === "Active" && call.streamCallId && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleJoinSession(call.streamCallId!)}
                              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleEndSession(call.id, call.streamCallId!)}
                              disabled={isEnding}
                              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                            >
                              {isEnding ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Ending...
                                </>
                              ) : (
                                <>
                                  <PhoneOff className="h-4 w-4 mr-2" />
                                  End
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
                            className="transition-all duration-300 hover:scale-110 hover:bg-primary/10"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Requests Section */}
                    {isExpanded && call.requests.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          Join Requests ({call.requests.length})
                        </h4>
                        <div className="space-y-3">
                          {call.requests.map((request, reqIndex) => {
                            const isLoading = loadingStates[request.id] || false;
                            const isInCall = request.status === "Accepted" && request.joinedAt;
                            
                            return (
                              <div
                                key={request.id}
                                className="group/request relative p-4 bg-gradient-to-r from-background to-muted/30 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                                style={{
                                  animation: `fadeIn 0.3s ease-out ${reqIndex * 0.05}s both`,
                                }}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                      <div className="flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-lg">
                                          {request.User.firstName[0]}{request.User.lastName?.[0] || ""}
                                        </div>
                                        <div>
                                          <span className="font-semibold">
                                            {request.User.firstName} {request.User.lastName}
                                          </span>
                                          <p className="text-xs text-muted-foreground">
                                            {request.User.email}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <Badge
                                        variant={
                                          request.status === "Accepted"
                                            ? "default"
                                            : request.status === "Rejected"
                                            ? "destructive"
                                            : "secondary"
                                        }
                                        className={`${
                                          request.status === "Accepted"
                                            ? "bg-green-500"
                                            : request.status === "Rejected"
                                            ? "bg-red-500"
                                            : "bg-yellow-500"
                                        } text-white font-semibold shadow-md transition-all duration-300 hover:scale-105`}
                                      >
                                        {request.status}
                                      </Badge>
                                      
                                      {isInCall && (
                                        <Badge variant="default" className="bg-green-500 animate-pulse shadow-lg">
                                          <Phone className="h-3 w-3 mr-1" />
                                          In Call
                                        </Badge>
                                      )}
                                      
                                      {request.status === "Accepted" && !request.joinedAt && (
                                        <Badge variant="secondary" className="bg-blue-500 text-white">
                                          Accepted (Not Joined)
                                        </Badge>
                                      )}
                                      
                                      {request.status === "Pending" && (
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                          Position: {request.position}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <p className="text-sm text-muted-foreground mb-2 pl-12">
                                      {request.supportType}
                                    </p>
                                    
                                    {isInCall && request.joinedAt && (
                                      <p className="text-xs text-muted-foreground pl-12">
                                        Joined: {new Date(request.joinedAt).toLocaleTimeString()}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {request.status === "Pending" &&
                                    call.status === "Active" && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="default"
                                          onClick={() =>
                                            handleUpdateRequestStatus(
                                              request.id,
                                              "Accepted"
                                            )
                                          }
                                          disabled={isLoading}
                                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                                        >
                                          {isLoading ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          ) : (
                                            <Check className="h-4 w-4 mr-1" />
                                          )}
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() =>
                                            handleUpdateRequestStatus(
                                              request.id,
                                              "Rejected"
                                            )
                                          }
                                          disabled={isLoading}
                                          className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                                        >
                                          {isLoading ? (
                                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                          ) : (
                                            <XCircle className="h-4 w-4 mr-1" />
                                          )}
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

