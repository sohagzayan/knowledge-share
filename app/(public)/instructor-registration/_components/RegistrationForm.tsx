"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";

const RegistrationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z
      .string()
      .email("Enter a valid email")
      .refine((value) => value.endsWith(".com"), {
        message: "Only .com emails are allowed",
      }),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegistrationFormValues = z.infer<typeof RegistrationSchema>;

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(RegistrationSchema),
    mode: "onSubmit",
  });

  const simulateEmailCheck = useCallback(async (email: string) => {
    // Simulated async check - replace with API call.
    await new Promise((resolve) => setTimeout(resolve, 400));
    const invalidDomains = ["fhkdf.com", "example.org"];
    return !invalidDomains.some((domain) => email.endsWith(domain));
  }, []);

  const handleEmailBlur = async () => {
    const email = getValues("email");
    if (!email) return;
    setEmailStatus("checking");
    const isValid = await simulateEmailCheck(email);
    setEmailStatus(isValid ? "valid" : "invalid");
    if (!isValid) {
      // Force error state by triggering validation with custom message
      await trigger("email");
    }
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    setIsSubmitting(true);
    console.log("Registration data", data);
    // TODO: integrate with backend action.
    setTimeout(() => setIsSubmitting(false), 800);
  };

  const inputClass =
    "mt-1 h-9 rounded-lg border border-border bg-transparent px-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition";

  const renderField = (
    id: keyof RegistrationFormValues,
    label: string,
    type: "text" | "email" | "password" = "text",
    extraProps: Record<string, unknown> = {}
  ) => (
    <div>
      <Label htmlFor={id} className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          className={`${inputClass} ${errors[id] ? "border-destructive ring-destructive" : ""}`}
          {...register(id)}
          {...extraProps}
        />
        {id === "email" && emailStatus === "valid" && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
        )}
      </div>
      {errors[id] && (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {errors[id]?.message}
        </p>
      )}
      {id === "email" && emailStatus === "invalid" && !errors.email && (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          This email domain is not allowed.
        </p>
      )}
    </div>
  );

  return (
    <>
      <div className="flex w-full px-6 pt-4">
        <div className="flex-1 rounded-t-lg border border-border bg-primary/10 px-3 py-1.5 text-center text-xs font-semibold text-primary">
          Tutor Instructor
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 pb-6 pt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderField("firstName", "First Name")}
          {renderField("lastName", "Last Name")}
        </div>
        {renderField("username", "Username")}
        {renderField("email", "Email", "email", { onBlur: handleEmailBlur, placeholder: "you@example.com" })}
        <div className="grid gap-4 sm:grid-cols-2">
          {renderField("password", "Password", "password")}
          {renderField("confirmPassword", "Password Confirmation", "password")}
        </div>
        <p className="text-xs text-muted-foreground">
          By signing up, I agree with the website&apos;s{" "}
          <Link href="#" className="text-primary underline">
            Terms and Conditions
          </Link>
          .
        </p>
        <Button type="submit" size="lg" disabled={isSubmitting} className="h-10 w-full rounded-full text-sm">
          {isSubmitting ? "Creating..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium">
            Login
          </Link>
        </p>
      </form>
    </>
  );
}


