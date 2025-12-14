"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { signIn, useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequestRoute() {
  return (
    <Suspense>
      <VerifyRequest />
    </Suspense>
  );
}

function VerifyRequest() {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [otp, setOtp] = useState("");
  const [emailPending, startTranstion] = useTransition();
  const [resendPending, setResendPending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const params = useSearchParams();
  const email = params.get("email") as string;
  const isOtpCompleted = otp.length === 6;

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.replace("/");
    }
  }, [status, session, router]);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(60);
    setCanResend(false);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCountdown();
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [startCountdown]);

  function verifyOtp() {
    startTranstion(async () => {
      try {
        // Verify email OTP
        const response = await fetch("/api/auth/email/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            otp: otp,
          }),
        });

        const result = await response.json();

        if (result.status === "success") {
          // Sign in with NextAuth using credentials provider
          const signInResult = await signIn("credentials", {
            email: result.user.email,
            redirect: false,
          });

          if (signInResult?.ok) {
            // Wait a bit for the session cookie to be set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Force session update
            await update();
            
            toast.success("Login successful!");
            
            // Small delay before redirect to ensure session is set
            setTimeout(() => {
              router.push("/");
              router.refresh();
            }, 200);
          } else {
            console.error("Sign in result:", signInResult);
            toast.error("Failed to create session. Please try again.");
          }
        } else {
          toast.error(result.message || "Invalid verification code");
        }
      } catch (error) {
        console.error("Email OTP verification error:", error);
        toast.error("An error occurred. Please try again.");
      }
    });
  }

  async function resendOtp() {
    if (!email || resendPending || !canResend) {
      return;
    }

    setResendPending(true);
    try {
      const response = await fetch("/api/auth/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success(result.message || "A new code has been sent.");
        startCountdown();
      } else {
        toast.error(result.message || "Unable to resend the code right now.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend the verification code. Please try again.");
    } finally {
      setResendPending(false);
    }
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription>
          We have sent a verification email code to your email address. Please
          open the email and paste the code below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <InputOTP
            value={otp}
            onChange={(value) => setOtp(value)}
            maxLength={6}
            className="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to your email
          </p>
          <p className="text-xs text-muted-foreground">
            {canResend
              ? "Didn't receive a code? You can resend it now."
              : `You can resend a code in ${countdown}s`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={resendOtp}
            disabled={!canResend || resendPending}
          >
            {resendPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span className="ml-2 text-sm">Sending...</span>
              </>
            ) : (
              "Resend code"
            )}
          </Button>
        </div>

        <Button
          onClick={verifyOtp}
          disabled={emailPending || !isOtpCompleted}
          className="w-full"
        >
          {emailPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            "Verify Account"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
