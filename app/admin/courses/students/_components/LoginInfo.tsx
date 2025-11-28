"use client";

import { Badge } from "@/components/ui/badge";
import { Monitor, Globe, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface LoginInfoProps {
  device: string | null;
  browser: string | null;
  country: string | null;
  ipAddress: string | null;
  lastLoginAt: Date | null;
  loading?: boolean;
}

export function LoginInfo({
  device,
  browser,
  country,
  ipAddress,
  lastLoginAt,
  loading = false,
}: LoginInfoProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 w-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (!lastLoginAt) {
    return <div className="text-xs text-muted-foreground">No login data</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2 text-xs">
        <Monitor className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">Device:</span>
        <span className="font-medium">{device || "Unknown"}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <Globe className="h-3 w-3 text-muted-foreground" />
        <span className="text-muted-foreground">Browser:</span>
        <span className="font-medium">{browser || "Unknown"}</span>
      </div>
      {country && (
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Country:</span>
          <Badge variant="outline" className="text-xs h-5">
            {country}
          </Badge>
        </div>
      )}
      {ipAddress && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">IP:</span>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{ipAddress}</code>
        </div>
      )}
      <div className="text-xs text-muted-foreground mt-2">
        Last login: {new Date(lastLoginAt).toLocaleString()}
      </div>
    </motion.div>
  );
}

