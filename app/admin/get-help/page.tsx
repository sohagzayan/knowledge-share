"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { HelpRequestForm } from "./_components/HelpRequestForm";

export default async function GetHelpPage() {
  const session = await requireAdmin();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Need Assistance?
        </h1>
        <p className="text-sm text-muted-foreground">
          Reach out to the support team or browse quick resources to get unstuck.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SupportCard
          title="Email Support"
          description="We usually reply in under 6 hours"
          icon={<IconMail className="h-5 w-5" />}
          actionLabel="support@edupeak.com"
        />
        <SupportCard
          title="Hotline"
          description="Weekdays 8AM-6PM (EST)"
          icon={<IconPhone className="h-5 w-5" />}
          actionLabel="+1 (650) 555-0199"
        />
      </div>

      <Card className="border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-md shadow-black/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We&apos;ll follow up via email with an answer.</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <a href="/admin/help-requests">View My Requests</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <HelpRequestForm 
            userEmail={(session.user as any).email || ""}
            userName={(session.user as any).firstName 
              ? `${(session.user as any).firstName} ${(session.user as any).lastName || ""}`.trim() 
              : (session.user as any).email || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SupportCard({
  title,
  description,
  icon,
  actionLabel,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel: string;
}) {
  return (
    <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardHeader className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative text-sm font-medium text-primary">{actionLabel}</CardContent>
    </Card>
  );
}

