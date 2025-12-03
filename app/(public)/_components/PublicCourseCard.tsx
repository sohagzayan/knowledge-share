"use client";

import { PublicCourseType } from "@/app/data/course/get-all-courses";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConstructUrl } from "@/hooks/use-construct-url";
import { 
  School, 
  TimerIcon, 
  Users, 
  BookOpen, 
  FileText,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "./WishlistButton";

interface iAppProps {
  data: PublicCourseType;
}

export function PublicCourseCard({ data }: iAppProps) {
  const thumbnailUrl = useConstructUrl(data.fileKey);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  return (
    <Card className="group relative py-0 gap-0 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
      {/* Wishlist Button */}
      <div className="absolute top-2 right-2 z-30">
        <WishlistButton courseId={data.id} className="h-9 w-9" />
      </div>

      {/* Level Badge */}
      <Badge className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md border-white/10 text-white text-xs px-2 py-0.5">
        {data.level}
      </Badge>
      
      {/* Compact Image Container */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
        <Image
          width={600}
          height={300}
          className="w-full aspect-[2.5/1] h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={thumbnailUrl}
          alt="Thumbnail Image of Course"
        />
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <Link
          className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors duration-200 text-foreground block group/link"
          href={`/courses/${data.slug}`}
        >
          <span className="group-hover/link:underline">{data.title}</span>
        </Link>

        {/* Compact Course Stats - Inline */}
        <div className="flex items-center gap-x-4 flex-wrap gap-y-1.5">
          <div className="flex items-center gap-x-1.5">
            <TimerIcon className="size-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">{data.duration}h</span>
          </div>
          <div className="flex items-center gap-x-1.5">
            <School className="size-3.5 text-primary" />
            <span className="text-xs text-muted-foreground line-clamp-1">{data.category}</span>
          </div>
          {data.chapterCount !== undefined && (
            <div className="flex items-center gap-x-1.5">
              <BookOpen className="size-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">{data.chapterCount} Ch</span>
            </div>
          )}
          {data.lessonCount !== undefined && (
            <div className="flex items-center gap-x-1.5">
              <FileText className="size-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">{data.lessonCount} Les</span>
            </div>
          )}
        </div>

        {/* Enrollment, Price and Button Row */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground whitespace-nowrap">
                {data.enrollmentCount ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="size-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-bold text-foreground">
                {formatPrice(data.price)}
              </span>
            </div>
          </div>
          <Link
            href={`/courses/${data.slug}`}
            className={buttonVariants({
              size: "sm",
              className: "h-8 px-3 text-xs group/btn transition-all duration-200 hover:shadow-md hover:shadow-primary/20 hover:scale-105 flex-shrink-0",
            })}
          >
            Learn More
            <ArrowRight className="size-3 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function PublicCourseCardSkeleton() {
  return (
    <Card className="group relative py-0 gap-0 overflow-hidden border-border/50 bg-card/50">
      <div className="absolute top-2 right-2 z-10">
        <Skeleton className="size-8 rounded-full" />
      </div>
      <div className="absolute top-2 left-2 z-10">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="w-full relative h-fit overflow-hidden">
        <Skeleton className="w-full aspect-[2.5/1] h-full object-cover" />
      </div>

      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-full rounded" />
        
        <div className="flex items-center gap-x-4 flex-wrap">
          <Skeleton className="h-3 w-12 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/30">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-3 w-12 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}
