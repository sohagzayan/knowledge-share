"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

type Course = {
  id: string;
  title: string;
};

type AnnouncementsFiltersProps = {
  selectedCourse: string;
  onCourseChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  courses: readonly Course[];
};

export function AnnouncementsFilters({
  selectedCourse,
  onCourseChange,
  sortBy,
  onSortByChange,
  courses,
}: AnnouncementsFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.01 }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="courses" className="text-sm font-semibold">
            Courses
          </Label>
          <Select value={selectedCourse} onValueChange={onCourseChange}>
            <SelectTrigger
              id="courses"
              className="w-full transition-all hover:border-primary/50 focus:border-primary"
            >
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="sort-by" className="text-sm font-semibold">
            Sort By
          </Label>
          <Select value={sortBy} onValueChange={onSortByChange}>
            <SelectTrigger
              id="sort-by"
              className="w-full transition-all hover:border-primary/50 focus:border-primary"
            >
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DESC">Newest First</SelectItem>
              <SelectItem value="ASC">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>
    </motion.div>
  );
}

