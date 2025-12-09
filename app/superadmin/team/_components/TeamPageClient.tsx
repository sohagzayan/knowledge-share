"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Shield, UserPlus, Mail, Clock, CheckCircle2, XCircle, Search, X, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  image: string | null;
  createdAt: Date;
  emailVerified: boolean;
  membershipRole: "Member" | "Admin" | "SuperAdmin" | null;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: "Member" | "Admin" | "SuperAdmin";
  createdAt: Date;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    username: string | null;
  } | null;
}

interface ActiveSuperAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  image: string | null;
  membershipRole: "SuperAdmin";
  joinedAt: Date;
}

interface TeamPageClientProps {
  users: User[];
  total: number;
  currentPage: number;
  search: string;
  pendingInvitations: PendingInvitation[];
  activeSuperAdmins: ActiveSuperAdmin[];
  workspaceId: string;
}

export function TeamPageClient({
  users,
  total,
  currentPage,
  search,
  pendingInvitations,
  activeSuperAdmins,
  workspaceId,
}: TeamPageClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(search);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [isEmailDisabled, setIsEmailDisabled] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [cancelingInvitationId, setCancelingInvitationId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const handleSearch = () => {
    setIsSearching(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", "1");
    router.push(`/superadmin/team?${params.toString()}`);
    // Reset searching state after navigation
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch("/api/superadmin/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: "SuperAdmin",
          workspaceId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Invitation sent successfully");
        if (result.invitation?.link) {
          setInvitationLink(result.invitation.link);
        } else {
          setInviteEmail("");
          setInviteDialogOpen(false);
          router.refresh();
        }
      } else {
        toast.error(result.error || "Failed to send invitation");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setInviting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    params.set("page", newPage.toString());
    router.push(`/superadmin/team?${params.toString()}`);
  };

  const handleCancelInvitation = async (invitationId: string) => {
    setCancelingInvitationId(invitationId);
    try {
      const response = await fetch(`/api/superadmin/team/invite/${invitationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Invitation canceled successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to cancel invitation");
      }
    } catch (error) {
      toast.error("An error occurred while canceling the invitation");
    } finally {
      setCancelingInvitationId(null);
    }
  };

  const handleRemoveSuperadmin = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      const response = await fetch("/api/superadmin/team/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          workspaceId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Superadmin removed successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove superadmin");
      }
    } catch (error) {
      toast.error("An error occurred while removing superadmin");
    } finally {
      setRemovingUserId(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-sm text-muted-foreground">
            Search for users and invite them to become superadmins
          </p>
        </div>
        <Dialog 
          open={inviteDialogOpen} 
          onOpenChange={(open) => {
            setInviteDialogOpen(open);
            if (!open) {
              // Reset state when dialog closes
              setIsEmailDisabled(false);
              setInviteEmail("");
              setInvitationLink(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                // Reset email disabled state when opening from main button
                setIsEmailDisabled(false);
                setInviteEmail("");
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Superadmin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Superadmin</DialogTitle>
              <DialogDescription>
                {isEmailDisabled
                  ? "Invite this user to become a superadmin."
                  : "Enter the email address or username of the user you want to invite as a superadmin."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email or Username</Label>
                <Input
                  id="email"
                  placeholder="user@example.com or @username"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isEmailDisabled}
                  className={isEmailDisabled ? "cursor-not-allowed bg-muted" : ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isEmailDisabled) {
                      handleInvite();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              {invitationLink ? (
                <div className="flex w-full flex-col gap-4">
                  <div className="space-y-2">
                    <Label>Invitation Link</Label>
                    <div className="flex gap-2">
                      <Input value={invitationLink} readOnly className="font-mono text-xs" />
                      <Button
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(invitationLink);
                          toast.success("Link copied to clipboard!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Share this link with the user. They can accept it to become a superadmin.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInviteEmail("");
                        setInvitationLink(null);
                        setInviteDialogOpen(false);
                        router.refresh();
                      }}
                      className="w-full"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={inviting}>
                    {inviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Superadmins Section */}
      {activeSuperAdmins.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            <h2 className="text-2xl font-bold tracking-tight">Active Superadmins</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {activeSuperAdmins.map((admin) => (
              <div
                key={admin.id}
                className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-purple-500/5 group-hover:via-purple-500/5 group-hover:to-purple-500/5" />
                
                <div className="relative p-6">
                  {/* Header with Avatar and Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-2 ring-purple-500/20 group-hover:ring-purple-500/40 transition-all duration-300">
                        <AvatarImage src={admin.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-700 text-white font-semibold text-lg">
                          {admin.firstName[0]}
                          {admin.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-purple-500 border-2 border-card flex items-center justify-center">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="font-semibold text-lg truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate mt-0.5">{admin.email}</p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Joined {formatDistanceToNow(admin.joinedAt, { addSuffix: true })}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow">
                      <Shield className="mr-1.5 h-3.5 w-3.5" />
                      Superadmin
                    </Badge>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={removingUserId === admin.id}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800/50 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                        >
                          {removingUserId === admin.id ? (
                            <>
                              <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600" />
                              Removing...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Remove Superadmin
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Superadmin</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <span className="font-semibold">
                              {admin.firstName} {admin.lastName}
                            </span>{" "}
                            ({admin.email}) from superadmins? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveSuperadmin(admin.id)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            Remove Superadmin
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      {invitation.user ? (
                        <div>
                          <p className="font-semibold">
                            {invitation.user.firstName} {invitation.user.lastName}
                          </p>
                          {invitation.user.username && (
                            <p className="text-xs text-muted-foreground">
                              @{invitation.user.username}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Not registered</span>
                      )}
                    </TableCell>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-500">
                        <Shield className="mr-1 h-3 w-3" />
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Clock className="mr-1 h-3 w-3" />
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(invitation.expiresAt, { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelInvitation(invitation.id)}
                        disabled={cancelingInvitationId === invitation.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {cancelingInvitationId === invitation.id ? (
                          <>
                            <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600" />
                            Canceling...
                          </>
                        ) : (
                          <>
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* User Search Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Search Users</h2>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
            <Input
              placeholder="Search by email, name, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="max-w-sm"
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-primary/50 group"
            >
              <span className={`relative z-10 flex items-center gap-2 transition-all duration-300 ${isSearching ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <Search className="h-4 w-4" />
                Search
              </span>
              {isSearching && (
                <span className="absolute inset-0 flex items-center justify-center animate-in fade-in-0 duration-300">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.image || undefined} />
                          <AvatarFallback>
                            {user.firstName[0]}
                            {user.lastName?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.username && (
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          Unverified
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.membershipRole ? (
                        <Badge
                          className={
                            user.membershipRole === "SuperAdmin"
                              ? "bg-purple-500"
                              : user.membershipRole === "Admin"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                          }
                        >
                          {user.membershipRole === "SuperAdmin" && (
                            <Shield className="mr-1 h-3 w-3" />
                          )}
                          {user.membershipRole}
                        </Badge>
                      ) : (
                        <Badge variant="outline">No Role</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.membershipRole === "SuperAdmin" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={removingUserId === user.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-800"
                            >
                              {removingUserId === user.id ? (
                                <>
                                  <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-red-600/30 border-t-red-600" />
                                  Removing...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-1 h-3 w-3" />
                                  Remove
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Superadmin</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove{" "}
                                <span className="font-semibold">
                                  {user.firstName} {user.lastName}
                                </span>{" "}
                                ({user.email}) from superadmins? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveSuperadmin(user.id)}
                                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                              >
                                Remove Superadmin
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setInviteEmail(user.email);
                            setIsEmailDisabled(true);
                            setInviteDialogOpen(true);
                          }}
                        >
                          <UserPlus className="mr-1 h-3 w-3" />
                          Invite
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {!isSearching && users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, total)} of {total} users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
