"use client";

import {
  useCall,
  DeviceSettings,
  VideoPreview,
} from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Loader2, Settings, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface MeetingSetupProps {
  onSetupComplete: () => void;
}

export function MeetingSetup({ onSetupComplete }: MeetingSetupProps) {
  const call = useCall();
  const params = useParams();
  const callId = params?.callId as string;
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isDevicesReady, setIsDevicesReady] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [permission, setPermission] = useState<{
    canJoin: boolean;
    isAdmin: boolean;
    isCourseOwner: boolean;
    isCreator: boolean;
    hasAcceptedRequest: boolean;
    requestStatus?: "Pending" | "Accepted" | "Rejected" | "Completed";
    requestId?: string;
  } | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  // Early return if call is not available
  if (!call) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Initializing call setup...</p>
        </div>
      </div>
    );
  }

  // Check permission when component loads
  useEffect(() => {
    const checkPermission = async () => {
      if (!callId) {
        setIsCheckingPermission(false);
        return;
      }

      try {
        const response = await fetch(`/api/support-calls/check-permission?streamCallId=${callId}`);
        if (response.ok) {
          const data = await response.json();
          setPermission(data);
        } else {
          console.error("Failed to check permission");
        }
      } catch (error) {
        console.error("Error checking permission:", error);
      } finally {
        setIsCheckingPermission(false);
      }
    };

    checkPermission();
  }, [callId]);

  // Wait for call to be ready and initialize devices (only if permission is granted)
  useEffect(() => {
    if (!permission?.canJoin) return;

    const initializeDevices = async () => {
      try {
        // Wait a bit for call to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to access devices - they might not be ready immediately
        if (call.camera && call.microphone) {
          // Devices are available - try to enable but don't fail on permission errors
          if (isCameraOn) {
            await call.camera.enable().catch((error: any) => {
              // Handle permission denied gracefully
              if (error?.message?.includes("Permission denied") || error?.name === "NotAllowedError") {
                console.log("Camera permission denied, continuing without camera");
                setIsCameraOn(false);
                toast.info("Camera permission denied. You can join without video.");
              } else {
                console.warn("Camera enable error:", error);
              }
            });
          }
          if (isMicEnabled) {
            await call.microphone.enable().catch((error: any) => {
              // Handle permission denied gracefully
              if (error?.message?.includes("Permission denied") || error?.name === "NotAllowedError") {
                console.log("Microphone permission denied, continuing without microphone");
                setIsMicEnabled(false);
                toast.info("Microphone permission denied. You can join without audio.");
              } else {
                console.warn("Microphone enable error:", error);
              }
            });
          }
          setIsDevicesReady(true);
        } else {
          // Devices not ready yet, but continue anyway
          setIsDevicesReady(true);
        }
      } catch (error) {
        console.warn("Error initializing devices:", error);
        setIsDevicesReady(true); // Continue anyway
      }
    };

    initializeDevices();
  }, [call, permission?.canJoin, isCameraOn, isMicEnabled]);

  // Control microphone
  useEffect(() => {
    if (!call?.microphone || !isDevicesReady) return;
    
    if (isMicEnabled) {
      call.microphone.enable().catch((error: any) => {
        // Handle permission errors gracefully
        if (error?.message?.includes("Permission denied") || error?.name === "NotAllowedError") {
          console.log("Microphone permission denied");
          setIsMicEnabled(false);
        } else {
          console.error("Microphone enable error:", error);
        }
      });
    } else {
      call.microphone.disable().catch(console.error);
    }
  }, [isMicEnabled, call, isDevicesReady]);

  // Control camera
  useEffect(() => {
    if (!call?.camera || !isDevicesReady) return;
    
    if (isCameraOn) {
      call.camera.enable().catch((error: any) => {
        // Handle permission errors gracefully
        if (error?.message?.includes("Permission denied") || error?.name === "NotAllowedError") {
          console.log("Camera permission denied");
          setIsCameraOn(false);
        } else {
          console.error("Camera enable error:", error);
        }
      });
    } else {
      call.camera.disable().catch(console.error);
    }
  }, [isCameraOn, call, isDevicesReady]);

  const handleToggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
  };

  const handleToggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const handleRequestJoin = async () => {
    if (!callId) return;

    setIsRequesting(true);
    try {
      // Get support call ID from stream call ID
      const supportCallResponse = await fetch(`/api/support-calls?streamCallId=${callId}`);
      if (!supportCallResponse.ok) {
        throw new Error("Failed to get support call");
      }

      const supportCall = await supportCallResponse.json();
      if (!supportCall?.id) {
        throw new Error("Support call not found");
      }

      const requestResponse = await fetch("/api/support-calls/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supportCallId: supportCall.id,
          supportType: "General Support",
        }),
      });

      if (requestResponse.ok) {
        toast.success("Request sent! Waiting for approval...");
        // Refresh permission check
        const permResponse = await fetch(`/api/support-calls/check-permission?streamCallId=${callId}`);
        if (permResponse.ok) {
          const data = await permResponse.json();
          setPermission(data);
        }
      } else if (requestResponse.status === 409) {
        toast.info("You have already requested to join this session");
      } else {
        throw new Error("Failed to send request");
      }
    } catch (error: any) {
      console.error("Error requesting join:", error);
      toast.error(error.message || "Failed to send request");
    } finally {
      setIsRequesting(false);
    }
  };

  // Show loading while checking permission
  if (isCheckingPermission) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show permission denied UI if user can't join
  if (!permission?.canJoin) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Permission Required</CardTitle>
            <CardDescription>
              You need permission to join this support session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {permission?.requestStatus === "Pending" && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">
                    Request Pending
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your request is waiting for approval
                  </p>
                </div>
              </div>
            )}

            {permission?.requestStatus === "Rejected" && (
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Request Rejected
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Your request to join was not approved
                  </p>
                </div>
              </div>
            )}

            {!permission?.requestStatus && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Click the button below to request permission to join this support session.
                </p>
                <Button
                  className="w-full"
                  onClick={handleRequestJoin}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    "Request to Join"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isDevicesReady) {
    return (
      <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Preparing devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-background m-0 p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Video Preview Card */}
          <Card className="md:col-span-1 p-6 flex flex-col">
            <div>
              <h1 className="text-xl font-semibold mb-1">Camera Preview</h1>
              <p className="text-sm text-muted-foreground">Make sure you look good!</p>
            </div>
            
            <div className="mt-4 flex-1 min-h-[400px] rounded-xl overflow-hidden bg-muted/50 border relative">
              {call.camera ? (
                <VideoPreview className="h-full w-full" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <VideoOff className="h-12 w-12 mx-auto mb-2" />
                    <p>Camera not available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Controls Card */}
          <Card className="md:col-span-1 p-6 flex flex-col">
            <div>
              <h1 className="text-xl font-semibold mb-1">Meeting Details</h1>
              <p className="text-sm text-muted-foreground">Configure your devices</p>
            </div>

            <div className="mt-6 space-y-6 flex-1">
              {/* Camera Control */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className={`h-5 w-5 ${isCameraOn ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Camera</p>
                    <p className="text-sm text-muted-foreground">
                      {isCameraOn ? "On" : "Off"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isCameraOn ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleCamera}
                  disabled={!call.camera}
                  className="rounded-full"
                >
                  {isCameraOn ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <VideoOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Microphone Control */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mic className={`h-5 w-5 ${isMicEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Microphone</p>
                    <p className="text-sm text-muted-foreground">
                      {isMicEnabled ? "On" : "Off"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={isMicEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleMic}
                  disabled={!call.microphone}
                  className="rounded-full"
                >
                  {isMicEnabled ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Device Settings */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-muted-foreground">Configure devices</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeviceSettings(!showDeviceSettings)}
                  className="rounded-full"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {showDeviceSettings && (
                <div className="p-4 rounded-lg border bg-muted/50">
                  <DeviceSettings />
                </div>
              )}

              {/* Join Button */}
              <div className="space-y-3 mt-8">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={async () => {
                    try {
                      console.log("Attempting to join call...");
                      // Join the call before proceeding to meeting room
                      const callAny = call as any;
                      if (callAny && typeof callAny.join === 'function') {
                        console.log("Calling call.join()...");
                        await callAny.join();
                        console.log("Call joined successfully");
                        // Wait a bit for call to be fully ready
                        await new Promise(resolve => setTimeout(resolve, 800));
                      } else if (call && typeof call.getOrCreate === 'function') {
                        console.log("Calling call.getOrCreate()...");
                        await call.getOrCreate();
                        console.log("Call created/retrieved successfully");
                        await new Promise(resolve => setTimeout(resolve, 800));
                      } else {
                        console.warn("No join method available on call object");
                      }
                      console.log("Proceeding to meeting room...");
                      onSetupComplete();
                    } catch (error: any) {
                      console.error("Error joining call:", error);
                      // If already joined, that's fine - proceed anyway
                      if (error?.message?.includes("already") || error?.message?.includes("Illegal State")) {
                        console.log("Call already joined, proceeding...");
                      }
                      // Proceed anyway - MeetingRoom will handle it
                      onSetupComplete();
                    }
                  }}
                >
                  Join Session
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Do not worry, our team is super friendly! We want you to succeed. 🎉
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
