"use client";

import { useActionState, useEffect } from "react";
import {
  upsertBillingAddressAction,
  type BillingFormState,
} from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type BillingAddressFormProps = {
  initialData: {
    firstName: string;
    lastName: string;
    companyName: string;
    phoneNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    vatNumber: string;
    notes: string;
  };
};

const idleState: BillingFormState = { status: "idle" };

export function BillingAddressForm({ initialData }: BillingAddressFormProps) {
  const [state, formAction] = useActionState(
    upsertBillingAddressAction,
    idleState
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-background/80 via-background to-background shadow-2xl shadow-emerald-500/10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_55%)] blur-3xl" />
      <CardHeader className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            💳
          </div>
          <div>
            <CardTitle className="text-2xl">Billing Address</CardTitle>
            <CardDescription>
              Keep your payment details up to date for seamless invoicing.
            </CardDescription>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          These details appear on receipts, invoices, and any billing-related communication.
        </p>
      </CardHeader>
      <CardContent>
        <form
          action={formAction}
          className="space-y-6 rounded-2xl border border-border/40 bg-background/80 p-6 shadow-inner shadow-emerald-500/5 backdrop-blur"
        >
          <FieldGrid>
            <BillingInput
              label="First Name"
              name="firstName"
              placeholder="First Name"
              defaultValue={initialData.firstName}
              required
            />
            <BillingInput
              label="Last Name"
              name="lastName"
              placeholder="Last Name"
              defaultValue={initialData.lastName}
              required
            />
          </FieldGrid>

          <FieldGrid>
            <BillingInput
              label="Company Name"
              name="companyName"
              placeholder="Company Name"
              defaultValue={initialData.companyName}
            />
            <BillingInput
              label="Phone Number"
              name="phoneNumber"
              placeholder="Phone Number"
              defaultValue={initialData.phoneNumber}
            />
          </FieldGrid>

          <FieldGrid>
            <BillingInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="email@example.com"
              defaultValue={initialData.email}
              required
            />
            <BillingInput
              label="Country"
              name="country"
              placeholder="Country"
              defaultValue={initialData.country}
              required
            />
          </FieldGrid>

          <AnimatedBlock>
            <BillingInput
              label="Address Line 1"
              name="addressLine1"
              placeholder="Address"
              defaultValue={initialData.addressLine1}
              required
            />
            <BillingInput
              label="Address Line 2"
              name="addressLine2"
              placeholder="Apartment, suite, etc."
              defaultValue={initialData.addressLine2}
            />
          </AnimatedBlock>

          <FieldGrid>
            <BillingInput
              label="City"
              name="city"
              placeholder="City"
              defaultValue={initialData.city}
              required
            />
            <BillingInput
              label="State / Province"
              name="state"
              placeholder="State or Province"
              defaultValue={initialData.state}
              required
            />
          </FieldGrid>

          <FieldGrid>
            <BillingInput
              label="Postal Code"
              name="postalCode"
              placeholder="Postal Code"
              defaultValue={initialData.postalCode}
              required
            />
            <BillingInput
              label="VAT Number"
              name="vatNumber"
              placeholder="VAT Number"
              defaultValue={initialData.vatNumber}
            />
          </FieldGrid>

          <AnimatedBlock>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Any additional information..."
                defaultValue={initialData.notes}
                className="rounded-2xl border border-border/60 bg-background/70 transition focus-visible:-translate-y-0.5 focus-visible:border-primary focus-visible:ring-primary/40"
              />
            </div>
          </AnimatedBlock>

          <div className="flex flex-wrap items-center gap-4">
            <SubmitButton />
            {state.status === "error" && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedBlock({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

type BillingInputProps = {
  label: string;
  name: string;
  placeholder: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
};

function BillingInput({
  label,
  name,
  placeholder,
  defaultValue,
  type = "text",
  required,
}: BillingInputProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
    >
      <Label htmlFor={name}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className={cn(
          "rounded-xl border border-border/60 bg-background/70 transition focus-visible:-translate-y-0.5 focus-visible:border-primary focus-visible:ring-primary/40"
        )}
      />
    </motion.div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="rounded-full border border-primary/40 bg-primary/90 px-6 py-1.5 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 disabled:opacity-70"
      disabled={pending}
    >
      <motion.span
        className="flex items-center gap-2"
        animate={
          pending
            ? { opacity: [0.6, 1, 0.6] }
            : { opacity: 1, transition: { duration: 0.2 } }
        }
        transition={{ duration: 1.2, repeat: pending ? Infinity : 0 }}
      >
        {pending ? "Saving..." : "Update Billing Address"}
      </motion.span>
    </Button>
  );
}

