"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [loginPending, startLoginTransition] = useTransition();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  async function signInWithCredentials() {
    if (!emailOrUsername) {
      toast.error("Please enter your email or username");
      return;
    }

    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    // Validate email format if it looks like an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(emailOrUsername.trim());

    startLoginTransition(async () => {
      try {
        const response = await fetch("/api/auth/email/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrUsername: emailOrUsername.trim(),
            password: password,
          }),
        });

        const result = await response.json();

        if (response.ok && result.status === "success") {
          toast.success("Verification code sent to your email!");
          router.push(`/verify-request?email=${encodeURIComponent(result.email)}`);
        } else {
          toast.error(result.message || "Failed to send verification code");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
        console.error("Login error:", error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back!</CardTitle>
        <CardDescription>
          Enter your credentials to receive a verification code
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="grid gap-2">
            <Label htmlFor="emailOrUsername">Email or Username</Label>
            <Input
              id="emailOrUsername"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              type="text"
              placeholder="your.email@example.com or username"
              required
              onKeyDown={(e) => {
                if (e.key === "Enter" && password) {
                  signInWithCredentials();
                }
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
              onKeyDown={(e) => {
                if (e.key === "Enter" && emailOrUsername && password) {
                  signInWithCredentials();
                }
              }}
            />
          </div>

          <Button onClick={signInWithCredentials} disabled={loginPending}>
            {loginPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Lock className="size-4" />
                <span>Continue</span>
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          We'll send you a 6-digit verification code to sign in securely
        </p>
      </CardContent>
    </Card>
  );
}
