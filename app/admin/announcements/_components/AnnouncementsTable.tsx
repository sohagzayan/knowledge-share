"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPencil, IconTrash, IconEye } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { EditAnnouncementModal } from "./EditAnnouncementModal";

type Announcement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  publishedAt: string | null;
  status: "Draft" | "Scheduled" | "Published" | "Expired";
  targetRole: string;
  isUrgent: boolean;
  viewCount: number;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    image: string | null;
  };
  targetCourse: {
    id: string;
    title: string;
    slug: string;
  } | null;
  _count: {
    readStatuses: number;
  };
};

type AnnouncementsTableProps = {
  announcements: Announcement[];
  onRefresh: () => void;
  isLoading?: boolean;
};

const getStatusBadge = (status: Announcement["status"]) => {
  const variants: Record<typeof status, { label: string; className: string }> = {
    Published: {
      label: "Published",
      className: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    },
    Draft: {
      label: "Draft",
      className: "bg-gray-500/20 text-gray-600 border-gray-500/30",
    },
    Scheduled: {
      label: "Scheduled",
      className: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    },
    Expired: {
      label: "Expired",
      className: "bg-red-500/20 text-red-600 border-red-500/30",
    },
  };

  const variant = variants[status];
  return (
    <Badge variant="outline" className={`${variant.className} gap-1.5 rounded-full px-3 py-1 text-xs font-medium`}>
      <span className="size-1.5 rounded-full bg-current" />
      {variant.label}
    </Badge>
  );
};

const getAudienceLabel = (targetRole: string, course: { title: string } | null) => {
  const labels: Record<string, string> = {
    AllStudents: "All Students",
    AllTeachers: "All Teachers",
    AllUsers: "All Users",
    CourseStudents: course ? `Students: ${course.title}` : "Course Students",
    SpecificStudents: "Specific Students",
    SpecificTeachers: "Specific Teachers",
  };
  return labels[targetRole] || targetRole;
};

export function AnnouncementsTable({
  announcements,
  onRefresh,
  isLoading,
}: AnnouncementsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete");
      }

      toast.success("Announcement deleted successfully");
      setDeleteId(null);
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete announcement");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
        className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold text-foreground">Date</TableHead>
                <TableHead className="font-semibold text-foreground">Title</TableHead>
                <TableHead className="font-semibold text-foreground">Audience</TableHead>
                <TableHead className="font-semibold text-foreground">Created By</TableHead>
                <TableHead className="font-semibold text-foreground">Views</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : announcements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No announcements found.
                  </TableCell>
                </TableRow>
              ) : (
                announcements.map((announcement, index) => (
                  <TableRow
                    key={announcement.id}
                    className={`border-border/30 transition-all duration-300 hover:bg-muted/20 hover:shadow-sm ${
                      announcement.isUrgent ? "bg-red-50/50 dark:bg-red-950/10" : ""
                    }`}
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                    }}
                  >
                    <TableCell className="text-muted-foreground">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.1, duration: 0.3 }}
                      >
                        {formatDate(announcement.publishedAt || announcement.createdAt)}
                      </motion.span>
                    </TableCell>
                    <TableCell>
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 + 0.15, duration: 0.3 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground transition-colors group-hover:text-primary">
                            {announcement.title}
                          </p>
                          {announcement.isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>
                        {announcement.targetCourse && (
                          <p className="text-sm text-muted-foreground">
                            Course: {announcement.targetCourse.title}
                          </p>
                        )}
                      </motion.div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getAudienceLabel(announcement.targetRole, announcement.targetCourse)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {announcement.createdBy.firstName} {announcement.createdBy.lastName || ""}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {announcement._count.readStatuses} / {announcement.viewCount}
                    </TableCell>
                    <TableCell>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.3, type: "spring" }}
                      >
                        {getStatusBadge(announcement.status)}
                      </motion.div>
                    </TableCell>
                    <TableCell>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.25, duration: 0.3 }}
                        className="flex items-center gap-1"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-border/50 text-muted-foreground transition-all hover:scale-110 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                          onClick={() => setEditId(announcement.id)}
                        >
                          <IconPencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full border border-border/50 text-muted-foreground transition-all hover:scale-110 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                          onClick={() => setDeleteId(announcement.id)}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editId && (
        <EditAnnouncementModal
          open={editId !== null}
          onOpenChange={(open) => !open && setEditId(null)}
          announcementId={editId}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
