"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, XCircle, Loader2, Users, X, Phone } from "lucide-react";
import { toast } from "sonner";

interface JoinRequest {
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
}

interface JoinRequestsPanelProps {
  streamCallId: string;
  onClose?: () => void;
}

export function JoinRequestsPanel({ streamCallId, onClose }: JoinRequestsPanelProps) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

  const fetchRequests = useCallback(async () => {
    try {
      // Get support call by streamCallId - this returns the call with requests
      const callResponse = await fetch(`/api/support-calls?streamCallId=${streamCallId}`, {
        cache: "no-store",
      });
      if (!callResponse.ok) return;
      
      const supportCall = await callResponse.json();
      if (supportCall?.requests) {
        setRequests(supportCall.requests || []);
      }
      
      // Check if user is admin or course owner (they can manage requests)
      // This will be handled by the API - if they can see requests, they can manage them
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [streamCallId]);

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 3 seconds
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleUpdateRequestStatus = async (
    requestId: string,
    status: "Accepted" | "Rejected"
  ) => {
    setLoadingStates((prev) => ({ ...prev, [requestId]: true }));
    try {
      const response = await fetch(`/api/support-calls/request/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update request");
      }

      toast.success(`Request ${status.toLowerCase()} successfully`);
      await fetchRequests();
    } catch (error: any) {
      console.error("Error updating request:", error);
      toast.error(error.message || "Failed to update request");
    } finally {
      setLoadingStates((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const activeParticipants = requests.filter((r) => r.status === "Accepted" && r.joinedAt);

  return (
    <Card className="w-80 bg-background/95 backdrop-blur-md border-2 border-primary/30 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col" style={{ maxHeight: "calc(100vh - 2rem)", height: "calc(100vh - 2rem)" }}>
      <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Join Requests</CardTitle>
              <p className="text-xs text-muted-foreground">
                {pendingRequests.length} pending
              </p>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-y-auto flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request, index) => {
              const isLoading = loadingStates[request.id] || false;
              
              return (
                <div
                  key={request.id}
                  className="p-4 rounded-xl bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                  style={{
                    animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                      {request.User.firstName[0]}{request.User.lastName?.[0] || ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm truncate">
                          {request.User.firstName} {request.User.lastName}
                        </span>
                        <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
                          Position: {request.position}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {request.User.email}
                      </p>
                      <p className="text-xs text-foreground line-clamp-2">
                        {request.supportType}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleUpdateRequestStatus(request.id, "Accepted")}
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUpdateRequestStatus(request.id, "Rejected")}
                      disabled={isLoading}
                      className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Active Participants Section */}
        {activeParticipants.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-500" />
              In Call ({activeParticipants.length})
            </h4>
            <div className="space-y-2">
              {activeParticipants.map((request) => (
                <div
                  key={request.id}
                  className="p-3 rounded-lg bg-green-500/10 border border-green-500/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xs">
                      {request.User.firstName[0]}{request.User.lastName?.[0] || ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {request.User.firstName} {request.User.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {request.User.email}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-500 animate-pulse text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
