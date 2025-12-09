"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Membership {
  id: string;
  role: "Member" | "Admin" | "SuperAdmin";
  createdAt: Date;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
}

interface MembershipPageClientProps {
  memberships: Membership[];
}

export function MembershipPageClient({ memberships }: MembershipPageClientProps) {
  const router = useRouter();
  const [accessingMembershipId, setAccessingMembershipId] = useState<string | null>(null);

  const handleAccessMembership = (membership: Membership) => {
    if (membership.role === "SuperAdmin") {
      setAccessingMembershipId(membership.id);
      // Redirect to superadmin dashboard
      router.push("/superadmin");
      toast.success("Accessing SuperAdmin features");
    } else {
      toast.info("This membership does not grant special access");
    }
  };

  const superAdminMemberships = memberships.filter((m) => m.role === "SuperAdmin");
  const otherMemberships = memberships.filter((m) => m.role !== "SuperAdmin");

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Memberships</h1>
        <p className="text-sm text-muted-foreground">
          Manage your workspace memberships and access levels
        </p>
      </div>

      {/* SuperAdmin Memberships */}
      {superAdminMemberships.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">SuperAdmin Access</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {superAdminMemberships.map((membership) => (
              <Card key={membership.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{membership.workspace.name}</CardTitle>
                    <Badge className="bg-purple-500">
                      <Shield className="mr-1 h-3 w-3" />
                      SuperAdmin
                    </Badge>
                  </div>
                  <CardDescription>
                    Joined {formatDistanceToNow(membership.createdAt, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have full SuperAdmin access to this workspace. Click below to access all
                    SuperAdmin features.
                  </p>
                  <Button
                    onClick={() => handleAccessMembership(membership)}
                    disabled={accessingMembershipId === membership.id}
                    className="w-full"
                  >
                    {accessingMembershipId === membership.id ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Accessing...
                      </>
                    ) : (
                      <>
                        Access SuperAdmin
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Other Memberships */}
      {otherMemberships.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Other Memberships</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherMemberships.map((membership) => (
              <Card key={membership.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{membership.workspace.name}</CardTitle>
                    <Badge
                      className={
                        membership.role === "Admin"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }
                    >
                      {membership.role}
                    </Badge>
                  </div>
                  <CardDescription>
                    Joined {formatDistanceToNow(membership.createdAt, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Active membership</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Memberships */}
      {memberships.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Memberships</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              You don't have any workspace memberships yet. Contact an administrator to get
              invited.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
