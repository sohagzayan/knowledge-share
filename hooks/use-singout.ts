"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();
  const handleSignout = async function signOutHandler() {
    try {
      // Sign out and wait for it to complete
      const result = await signOut({ 
        redirect: false,
        callbackUrl: "/"
      });
      
      // Wait a bit to ensure session cookie is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Clear any cached session data by doing a hard redirect
      // Use window.location to ensure a full page reload and clear all caches
      window.location.href = "/";
      
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      // Even on error, try to redirect to home
      window.location.href = "/";
    }
  };

  return handleSignout;
}
