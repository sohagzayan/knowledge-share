"use client";

import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useGetCallById } from "@/hooks/use-get-call-by-id";
import { MeetingSetup } from "@/components/video-call/MeetingSetup";
import { MeetingRoom } from "@/components/video-call/MeetingRoom";
import { RequestToJoin } from "@/components/video-call/RequestToJoin";
import { Loader2 } from "lucide-react";

interface PermissionData {
  canJoin: boolean;
  reason?: string;
  supportCall?: {
    id: string;
    title: string | null;
    description: string | null;
    status: string;
    streamCallId: string | null;
  };
  userRequest?: {
    id: string;
    status: string;
    supportType: string;
  } | null;
}

export default function CallPage() {
  const params = useParams();
  const callId = params?.callId as string;
  const { call, isCallLoading } = useGetCallById(callId);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [permission, setPermission] = useState<PermissionData | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!callId) {
        setIsCheckingPermission(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/support-calls/check-permission?streamCallId=${callId}`
        );
        if (response.ok) {
          const data = await response.json();
          setPermission(data);
        } else {
          // If permission check fails, assume no permission
          setPermission({
            canJoin: false,
            reason: "Unable to verify permission",
          });
        }
      } catch (error) {
        console.error("Error checking permission:", error);
        setPermission({
          canJoin: false,
          reason: "Error checking permission",
        });
      } finally {
        setIsCheckingPermission(false);
      }
    };

    checkPermission();
  }, [callId]);

  if (isCallLoading || isCheckingPermission) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-0">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading session...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please wait while we prepare your call
          </p>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-0">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive mb-2">
            Session not found
          </p>
          <p className="text-sm text-muted-foreground">
            The support session you're looking for doesn't exist or has ended.
          </p>
        </div>
      </div>
    );
  }

  // If user doesn't have permission to join, show request form
  if (permission && !permission.canJoin && permission.supportCall) {
    return (
      <RequestToJoin
        supportCallId={permission.supportCall.id}
        streamCallId={callId}
        existingRequest={permission.userRequest || null}
        onRequestSubmitted={() => {
          // Refresh permission check
          window.location.reload();
        }}
      />
    );
  }

  // User has permission, show the call interface
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        margin: 0,
        padding: 0,
        width: "100vw",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </div>
  );
}


