"use client";

import {
  useCall,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  PaginatedGridLayout,
  PermissionRequests,
} from "@stream-io/video-react-sdk";
import { useState, Suspense, useMemo, useEffect } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, X, Users, UserPlus } from "lucide-react";
import { JoinRequestsPanel } from "./JoinRequestsPanel";

// Separate component for video layout to isolate from parent re-renders
// Using React.memo with no props to ensure it never re-renders
const VideoLayoutComponent = React.memo(function VideoLayoutComponent() {
  return <SpeakerLayout />;
});

// Ensure the component is treated as equal in all cases to prevent re-renders
VideoLayoutComponent.displayName = "VideoLayoutComponent";

export function MeetingRoom() {
  const router = useRouter();
  const call = useCall();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  
  // Memoize the layout component to prevent re-renders
  const memoizedLayout = useMemo(() => <VideoLayoutComponent />, []);
  
  // Get streamCallId from the call
  const streamCallId = call?.id;
  
  // Fetch pending request count for badge
  useEffect(() => {
    if (!streamCallId) return;
    
    const fetchRequestCount = async () => {
      try {
        const response = await fetch(`/api/support-calls?streamCallId=${streamCallId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const supportCall = await response.json();
          const pending = (supportCall?.requests || []).filter((r: any) => r.status === "Pending");
          setPendingRequestCount(pending.length);
        }
      } catch (error) {
        console.error("Error fetching request count:", error);
      }
    };
    
    fetchRequestCount();
    const interval = setInterval(fetchRequestCount, 3000);
    return () => clearInterval(interval);
  }, [streamCallId]);

  // If no call, show loading
  if (!call) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-0">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Initializing call...</p>
        </div>
      </div>
    );
  }

  // Render immediately - Stream.io components handle their own loading states
  // The call should already be joined from MeetingSetup

  return (
    <div 
      className="fixed inset-0 overflow-hidden bg-black" 
      style={{ 
        margin: 0, 
        padding: 0,
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {/* Main Video Layout - Full Screen */}
      <div 
        className="absolute inset-0 w-full h-full" 
        style={{ 
          width: '100%', 
          height: '100%', 
          margin: 0, 
          padding: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          {memoizedLayout}
        </Suspense>
      </div>

      {/* Join Requests Panel - Custom panel for support call requests */}
      {showRequests && streamCallId && (
        <div className="absolute right-0 top-0 bottom-0 z-50 flex items-start justify-center animate-in slide-in-from-right duration-300 p-4">
          <JoinRequestsPanel 
            streamCallId={streamCallId} 
            onClose={() => setShowRequests(false)}
          />
        </div>
      )}

      {/* Pre-built Participants List - Stream.io Default Styling */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 z-50">
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      )}

      {/* Pre-built Permission Requests - Shows permission requests from participants */}
      <PermissionRequests />

      {/* Pre-built Call Controls - Shows all available controls based on permissions */}
      <div 
        className="absolute bottom-0 left-0 right-0 pb-4"
        style={{
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
      >
        <div className="flex items-center gap-2">
          {/* Join Requests Toggle Button */}
          {streamCallId && (
            <Button
              variant={showRequests ? "default" : "outline"}
              size="icon"
              className="size-10 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 relative"
              onClick={() => setShowRequests(!showRequests)}
              title={showRequests ? "Hide Join Requests" : "Show Join Requests"}
            >
              <UserPlus className="size-4" />
              {pendingRequestCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center animate-pulse border-2 border-background">
                  {pendingRequestCount > 9 ? "9+" : pendingRequestCount}
                </span>
              )}
            </Button>
          )}
          
          {/* Participants List Toggle Button */}
          <Button
            variant={showParticipants ? "default" : "outline"}
            size="icon"
            className="size-10 rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
            onClick={() => setShowParticipants(!showParticipants)}
            title={showParticipants ? "Hide Participants" : "Show Participants"}
          >
            <Users className="size-4" />
          </Button>
          
          {/* Pre-built Call Controls */}
          <CallControls onLeave={() => router.push("/")} />
        </div>
      </div>
    </div>
  );
}
