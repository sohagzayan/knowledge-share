"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, X, RefreshCw, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface CertificateManagementProps {
  certificateEarned: boolean;
  certificateIssuedAt: Date | null;
  certificateKey: string | null;
  certificateRevoked: boolean;
  enrollmentId: string;
  courseId: string;
  userId: string;
  onUpdate?: () => void;
}

export function CertificateManagement({
  certificateEarned,
  certificateIssuedAt,
  certificateKey,
  certificateRevoked,
  enrollmentId,
  courseId,
  userId,
  onUpdate,
}: CertificateManagementProps) {
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleIssueCertificate = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}/certificate/issue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId, userId }),
        });

        if (response.ok) {
          toast.success("Certificate issued successfully");
          onUpdate?.();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to issue certificate");
        }
      } catch (error) {
        toast.error("Failed to issue certificate");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleRevokeCertificate = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}/certificate/revoke`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId }),
        });

        if (response.ok) {
          toast.success("Certificate revoked successfully");
          onUpdate?.();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to revoke certificate");
        }
      } catch (error) {
        toast.error("Failed to revoke certificate");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleReissueCertificate = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}/certificate/reissue`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId, userId }),
        });

        if (response.ok) {
          toast.success("Certificate reissued successfully");
          onUpdate?.();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to reissue certificate");
        }
      } catch (error) {
        toast.error("Failed to reissue certificate");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDownload = () => {
    if (!certificateKey) return;
    
    window.open(`/api/admin/courses/${courseId}/certificate/download?key=${certificateKey}`, "_blank");
  };

  if (!certificateEarned && !certificateRevoked) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          Not Earned
        </Badge>
        <Button
          size="sm"
          variant="outline"
          onClick={handleIssueCertificate}
          disabled={loading || pending}
          className="h-7 text-xs"
        >
          <Award className="h-3 w-3 mr-1" />
          Issue Certificate
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 flex-wrap"
    >
      {certificateRevoked ? (
        <>
          <Badge variant="destructive" className="text-xs">
            Revoked
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReissueCertificate}
            disabled={loading || pending}
            className="h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reissue
          </Button>
        </>
      ) : (
        <>
          <Badge variant="default" className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50">
            <Award className="h-3 w-3 mr-1" />
            Earned
          </Badge>
          {certificateIssuedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(certificateIssuedAt).toLocaleDateString()}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="h-7 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRevokeCertificate}
            disabled={loading || pending}
            className="h-7 text-xs text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3 mr-1" />
            Revoke
          </Button>
        </>
      )}
    </motion.div>
  );
}

