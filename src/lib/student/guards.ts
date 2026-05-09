import { redirect } from "next/navigation";

import { getCurrentUserFromSession } from "@/lib/auth/session";

export async function requireStudentUser() {
  const user = await getCurrentUserFromSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  if (!user.profile_completed) {
    redirect("/onboarding");
  }

  return user;
}
