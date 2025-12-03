import { AdminCourseType } from "@/app/data/admin/admin-get-courses";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import {
  ArrowRight,
  Eye,
  MoreVertical,
  Pencil,
  School,
  TimerIcon,
  Trash2,
  Users,
  BookOpen,
  FileText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { EnrolledStudentsList } from "./EnrolledStudentsList";

interface iAppProps {
  data: AdminCourseType;
}

export function AdminCourseCard({ data }: iAppProps) {
  const thumbnailUrl = useConstructUrl(data.fileKey);
  return (
    <Card className="group relative py-0 gap-0 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
      {/* absolute dropdrown */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon"
              className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 hover:bg-black/80 hover:border-white/20 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <MoreVertical className="size-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-border/50 shadow-xl">
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.id}/edit`} className="cursor-pointer">
                <Pencil className="size-4 mr-2" />
                Edit Course
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/courses/${data.slug}`} className="cursor-pointer">
                <Eye className="size-4 mr-2" />
                Preview
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/admin/courses/${data.id}/delete`} className="cursor-pointer">
                <Trash2 className="size-4 mr-2 text-destructive" />
                Delete Course
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Image Container with Overlay */}
      <div className="relative overflow-hidden rounded-t-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <Image
          src={thumbnailUrl}
          alt="Thumbnail Url"
          width={600}
          height={400}
          className="w-full aspect-video h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <CardContent className="p-5 space-y-4">
        <Link
          href={`/admin/courses/${data.id}/edit`}
          className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors duration-200 text-foreground block group/link"
        >
          <span className="group-hover/link:underline">{data.title}</span>
        </Link>

        <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
          {data.smallDescription}
        </p>

        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-x-2.5">
            <div className="p-1.5 rounded-lg text-primary bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 transition-all duration-200">
              <TimerIcon className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">{data.duration}h</p>
            </div>
          </div>
          <div className="flex items-center gap-x-2.5">
            <div className="p-1.5 rounded-lg text-primary bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 transition-all duration-200">
              <School className="size-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-sm font-medium text-foreground">{data.level}</p>
            </div>
          </div>
          {data.chapterCount !== undefined && (
            <div className="flex items-center gap-x-2.5">
              <div className="p-1.5 rounded-lg text-primary bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 transition-all duration-200">
                <BookOpen className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Chapters</p>
                <p className="text-sm font-medium text-foreground">{data.chapterCount}</p>
              </div>
            </div>
          )}
          {data.lessonCount !== undefined && (
            <div className="flex items-center gap-x-2.5">
              <div className="p-1.5 rounded-lg text-primary bg-primary/10 ring-1 ring-primary/20 group-hover:bg-primary/15 group-hover:ring-primary/30 transition-all duration-200">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lessons</p>
                <p className="text-sm font-medium text-foreground">{data.lessonCount}</p>
              </div>
            </div>
          )}
        </div>

        {/* Enrollment Count and Status */}
        <div className="flex items-center justify-between pt-2 pb-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {data.enrollmentCount ?? 0} {data.enrollmentCount === 1 ? "Student" : "Students"}
            </span>
          </div>
          <Badge
            variant={data.status === "Published" ? "default" : "secondary"}
            className="text-xs"
          >
            {data.status}
          </Badge>
        </div>

        {/* Enrolled Students List */}
        <EnrolledStudentsList courseId={data.id} />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Link
            className={buttonVariants({
              className: "flex-1 group/btn transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]",
            })}
            href={`/admin/courses/${data.id}/edit`}
          >
            Edit Course 
            <ArrowRight className="size-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
          </Link>
          <Link
            className={buttonVariants({
              variant: "outline",
              className: "flex-1 group/btn border-border/50 hover:border-primary/30 hover:bg-accent/50 transition-all duration-200 hover:scale-[1.02]",
            })}
            href={`/admin/courses/students?courseId=${data.id}`}
          >
            <Users className="size-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
            Manage Students
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminCourseCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0 overflow-hidden border-border/50 bg-card/50">
      <div className="absolute top-3 right-3 z-10">
        <Skeleton className="size-9 rounded-full" />
      </div>
      <div className="w-full relative h-fit overflow-hidden rounded-t-xl">
        <Skeleton className="w-full aspect-video h-full object-cover" />
      </div>
      <CardContent className="p-5 space-y-4">
        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <div className="flex items-center gap-x-6 pt-2">
          <div className="flex items-center gap-x-2.5">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-4 w-10 rounded" />
          </div>
          <div className="flex items-center gap-x-2.5">
            <Skeleton className="size-7 rounded-lg" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 flex-1 rounded" />
          <Skeleton className="h-10 flex-1 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
