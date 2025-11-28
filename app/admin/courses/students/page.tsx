import { adminGetCourse } from "@/app/data/admin/admin-get-course";
import { CourseAssignmentsView } from "./_components/CourseAssignmentsView";
import { StudentManagementView } from "./_components/StudentManagementView";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notFound } from "next/navigation";

type SearchParams = Promise<{ courseId?: string }>;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { courseId } = await searchParams;

  if (!courseId) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="size-4 mr-2" />
                Back to Courses
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Student Management</h1>
          </div>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Please select a course to view student management.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const course = await adminGetCourse(courseId);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="size-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">
            Student Management:{" "}
            <span className="text-primary underline">{course.title}</span>
          </h1>
        </div>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="students">Student Management</TabsTrigger>
          <TabsTrigger value="assignments">Assignment Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription>
                Manage students, view progress, ban users, send follow-up emails, and view leaderboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentManagementView courseId={courseId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Submissions</CardTitle>
              <CardDescription>
                View chapters, lessons, and student assignment submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseAssignmentsView courseId={courseId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

