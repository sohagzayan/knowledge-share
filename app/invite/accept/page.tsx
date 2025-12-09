"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const token = searchParams.get("token");
  const [accepting, setAccepting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" && token) {
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`);
    }
  }, [status, token, router]);

  const handleAccept = async () => {
    if (!token) {
      toast.error("Invalid invitation link");
      return;
    }

    setAccepting(true);
    try {
      const response = await fetch("/api/superadmin/team/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Invitation accepted successfully!",
        });
        toast.success("Invitation accepted successfully!");
        
        // Refresh session to get updated role and membership info
        await update();
        
        // Redirect based on the invitation role
        setTimeout(() => {
          if (data.role === "SuperAdmin" && data.userRoleUpdated) {
            // If user became superadmin, redirect to superadmin dashboard
            router.push("/superadmin");
          } else {
            // Otherwise redirect to membership page
            router.push("/admin/membership");
          }
        }, 2000);
      } else {
        let errorMessage = data.error || "Failed to accept invitation";
        if (data.invitationEmail) {
          errorMessage += ` (Invitation was sent to: ${data.invitationEmail})`;
        }
        setResult({
          success: false,
          message: errorMessage,
        });
        toast.error(errorMessage);
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while accepting the invitation",
      });
      toast.error("An error occurred");
    } finally {
      setAccepting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              This invitation link is invalid or missing a token.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {result.success ? "Invitation Accepted" : "Error"}
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your membership has been added. You can now access superadmin features through your membership. Redirecting...
                </p>
                <Button onClick={() => {
                  const userRole = (session?.user as { role?: string })?.role;
                  router.push("/admin/membership");
                }} className="w-full">
                  View Memberships
                </Button>
              </div>
            ) : (
              <Button onClick={() => router.push("/")} className="w-full">
                Go to Homepage
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You have been invited to become a superadmin. Accepting will add a membership without changing your current role. Click the button below to accept.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.user && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Logged in as:</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          )}
          <Button
            onClick={handleAccept}
            disabled={accepting || !session}
            className="w-full"
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
          {!session && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to accept this invitation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
