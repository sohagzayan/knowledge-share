"use client";

import { Call } from "@stream-io/video-react-sdk";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";

export function useGetCallById(id: string | string[] | undefined) {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);
  const client = useStreamVideoClient();

  useEffect(() => {
    if (!client || !id) {
      setIsCallLoading(false);
      return;
    }

    const callId = Array.isArray(id) ? id[0] : id;
    const streamCall = client.call("default", callId);

    // Use getOrCreate to ensure the call exists
    streamCall
      .getOrCreate()
      .then(async () => {
        setCall(streamCall);
        setIsCallLoading(false);
      })
      .catch((error) => {
        console.error("Error getting/creating call:", error);
        setIsCallLoading(false);
      });
  }, [client, id]);

  return { call, isCallLoading };
}

