import { adminGetCourseStudents } from "@/app/data/admin/admin-get-course-students";
import { StudentsManagement } from "./StudentsManagement";

interface iAppProps {
  courseId: string;
}

export async function StudentsManagementWrapper({ courseId }: iAppProps) {
  const students = await adminGetCourseStudents(courseId);
  return <StudentsManagement courseId={courseId} initialStudents={students} />;
}

