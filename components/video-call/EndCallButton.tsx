"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function EndCallButton() {
  const call = useCall();
  const router = useRouter();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const [isEnding, setIsEnding] = useState(false);

  const isCallOwner =
    localParticipant?.userId === call?.state.createdBy?.id;

  if (!isCallOwner) {
    return null;
  }

  const handleEndCall = async () => {
    if (!call) return;

    setIsEnding(true);
    try {
      // Get support call ID from call custom data
      const courseId = call.state.custom?.courseId as string | undefined;

      // End the Stream.io call
      await call.endCall();

      // If this is a support call, update database
      if (courseId) {
        try {
          const response = await fetch(
            `/api/support-calls/${call.id}/end`,
            {
              method: "POST",
            }
          );

          if (!response.ok) {
            console.error("Failed to update support call status");
          }
        } catch (error) {
          console.error("Error updating support call:", error);
        }
      }

      toast.success("Session ended");
      router.push("/");
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end session");
    } finally {
      setIsEnding(false);
    }
  };

  return (
    <Button
      onClick={handleEndCall}
      disabled={isEnding}
      variant="destructive"
      size="icon"
      className="size-10 rounded-full"
    >
      <PhoneOff className="size-4" />
    </Button>
  );
}


