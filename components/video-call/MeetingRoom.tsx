"use client";

import {
  useCall,
  CallControls,
  CallParticipantsList,
  SpeakerLayout,
  PaginatedGridLayout,
  PermissionRequests,
} from "@stream-io/video-react-sdk";
import { useState, Suspense, useMemo } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, X, Users } from "lucide-react";

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
  
  // Memoize the layout component to prevent re-renders
  const memoizedLayout = useMemo(() => <VideoLayoutComponent />, []);

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
          {/* Participants List Toggle Button */}
          <Button
            variant={showParticipants ? "default" : "outline"}
            size="icon"
            className="size-10 rounded-full"
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
