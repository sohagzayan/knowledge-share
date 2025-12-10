"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Uploader } from "@/components/file-uploader/Uploader";
import { useSession } from "next-auth/react";

type Course = {
  id: string;
  title: string;
};

type CreateAnnouncementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: readonly Course[];
  onSuccess?: () => void;
};

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  targetRole: z.enum(["AllStudents", "AllTeachers", "AllUsers", "SpecificStudents", "SpecificTeachers", "CourseStudents"]),
  targetCourseId: z.string().optional().nullable(),
  targetUserIds: z.array(z.string()).optional().default([]),
  scheduledAt: z.string().optional().nullable(),
  isUrgent: z.boolean().optional().default(false),
  attachmentKeys: z.array(z.string()).optional().default([]),
  publishNow: z.boolean().optional().default(true),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export function CreateAnnouncementModal({
  open,
  onOpenChange,
  courses,
  onSuccess,
}: CreateAnnouncementModalProps) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isSuperadmin = userRole === "superadmin";
  const isAdmin = userRole === "admin";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      body: "",
      targetRole: "AllStudents",
      targetCourseId: null,
      targetUserIds: [],
      scheduledAt: null,
      isUrgent: false,
      attachmentKeys: [],
      publishNow: true,
    },
  });

  const targetRole = form.watch("targetRole");
  const targetCourseId = form.watch("targetCourseId");

  // Fetch users when needed
  useEffect(() => {
    if (targetRole === "SpecificStudents" || targetRole === "SpecificTeachers") {
      const fetchUsers = async () => {
        try {
          const role = targetRole === "SpecificStudents" ? "user" : "admin";
          const response = await fetch(`/api/students`);
          if (response.ok) {
            const data = await response.json();
            setUsers(data.map((u: any) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName || ""}`.trim(),
              email: u.email,
            })));
          }
        } catch (error) {
          console.error("Failed to fetch users:", error);
        }
      };
      fetchUsers();
    }
  }, [targetRole]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return courses;
    }
    const query = searchQuery.toLowerCase();
    return courses.filter((course) =>
      course.title.toLowerCase().includes(query)
    );
  }, [courses, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }
    const query = searchQuery.toLowerCase();
    return users.filter((user) =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      // The body will be converted to HTML in the API
      const payload = {
        ...data,
        targetUserIds: (targetRole === "SpecificStudents" || targetRole === "SpecificTeachers") 
          ? selectedUsers 
          : [],
      };

      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create announcement");
      }

      toast.success("Announcement created successfully");
      form.reset();
      setSelectedUsers([]);
      setSearchQuery("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create announcement");
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedUsers([]);
    setSearchQuery("");
    onOpenChange(false);
  };

  // Filter available target roles based on user role
  const availableTargetRoles = isSuperadmin
    ? ["AllStudents", "AllTeachers", "AllUsers", "SpecificStudents", "SpecificTeachers", "CourseStudents"]
    : ["AllStudents", "SpecificStudents", "CourseStudents"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <AnimatePresence>
        {open && (
          <DialogContent className="max-h-[90vh] overflow-hidden border-border/50 bg-gradient-to-br from-background/98 via-background/95 to-background p-0 shadow-2xl flex flex-col w-[calc(100%-2rem)] max-w-[min(56rem,calc(100vw-2rem))]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
              className="relative p-6 md:p-8 overflow-y-auto flex-1 min-w-0"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50" />
              <DialogHeader className="relative space-y-2 text-left">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Create Announcement
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="relative mt-6 space-y-6 w-full min-w-0">
                  {/* Target Role - MUST BE FIRST to determine if course field is needed */}
                  <FormField
                    control={form.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Target Audience</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear course selection if not targeting course students
                            if (value !== "CourseStudents") {
                              form.setValue("targetCourseId", null);
                            }
                            // Clear user selection if not targeting specific users
                            if (value !== "SpecificStudents" && value !== "SpecificTeachers") {
                              setSelectedUsers([]);
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full max-w-full min-w-0">
                              <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTargetRoles.map((role) => (
                              <SelectItem key={role} value={role}>
                                {role === "AllStudents" && "All Students"}
                                {role === "AllTeachers" && "All Teachers/Admin"}
                                {role === "AllUsers" && "All Users"}
                                {role === "CourseStudents" && "Students of a Specific Course"}
                                {role === "SpecificStudents" && "Specific Students"}
                                {role === "SpecificTeachers" && "Specific Teachers"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Course Selection - ONLY shows when "CourseStudents" is selected */}
                  {targetRole === "CourseStudents" && (
                    <FormField
                      control={form.control}
                      name="targetCourseId"
                      render={({ field }) => (
                        <FormItem className="w-full min-w-0">
                          <FormLabel>Select Course</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full max-w-full min-w-0">
                                <SelectValue placeholder="Select a course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-w-[var(--radix-select-trigger-width)]">
                              <div className="sticky top-0 z-10 border-b border-border/50 bg-background p-2">
                                <div className="relative">
                                  <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-9 pl-9 pr-8 w-full"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              {filteredCourses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Announcement Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter announcement title"
                            {...field}
                            className="h-12 w-full max-w-full min-w-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Body - Rich Text Editor */}
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem className="w-full min-w-0">
                        <FormLabel>Announcement Body</FormLabel>
                        <FormControl>
                          <div className="w-full max-w-full min-w-0">
                          <RichTextEditor field={field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Specific Users Selection */}
                  {(targetRole === "SpecificStudents" || targetRole === "SpecificTeachers") && (
                    <FormItem className="w-full min-w-0">
                      <FormLabel>Select Users</FormLabel>
                      <div className="space-y-2 w-full min-w-0">
                        <div className="relative w-full min-w-0">
                          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full max-w-full min-w-0"
                          />
                        </div>
                        <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedUsers([...selectedUsers, user.id]);
                                  } else {
                                    setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                                  }
                                }}
                              />
                              <span className="text-sm">{user.name} ({user.email})</span>
                            </div>
                          ))}
                        </div>
                        {selectedUsers.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {selectedUsers.length} user(s) selected
                          </p>
                        )}
                      </div>
                    </FormItem>
                  )}

                  {/* Urgent Toggle */}
                  <FormField
                    control={form.control}
                    name="isUrgent"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 w-full min-w-0">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <FormLabel>Mark as Urgent</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Urgent announcements appear at the top
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Publish Settings */}
                  <FormField
                    control={form.control}
                    name="publishNow"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 w-full min-w-0">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <FormLabel>Publish Now</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Uncheck to schedule for later
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue("scheduledAt", null);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Schedule Date/Time */}
                  {!form.watch("publishNow") && (
                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem className="w-full min-w-0">
                          <FormLabel>Schedule Date & Time</FormLabel>
                          <FormControl>
                          <Input
                            type="datetime-local"
                            value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value ? new Date(value).toISOString() : null);
                            }}
                            className="w-full max-w-full min-w-0"
                          />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Attachments */}
                  <FormItem className="w-full min-w-0">
                    <FormLabel>Attachments (Optional)</FormLabel>
                    <div className="w-full max-w-full min-w-0">
                    <Uploader
                      fileTypeAccepted="document"
                      onChange={(key) => {
                        const current = form.getValues("attachmentKeys") || [];
                        if (key && !current.includes(key)) {
                          form.setValue("attachmentKeys", [...current, key]);
                        }
                      }}
                    />
                    </div>
                    {form.watch("attachmentKeys")?.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {form.watch("attachmentKeys")?.length} file(s) attached
                      </p>
                    )}
                  </FormItem>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 w-full min-w-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 min-w-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || (targetRole === "CourseStudents" && !targetCourseId)}
                      className="flex-1 min-w-0 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                    >
                      {form.formState.isSubmitting ? "Creating..." : "Create Announcement"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
