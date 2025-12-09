import { auth } from "@/lib/auth";
import { LoginForm } from "./_components/LoginForm";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  // Check session and redirect if already logged in
  const session = await auth();
  
  if (session?.user) {
    redirect("/");
  }
  
  return <LoginForm />;
}
