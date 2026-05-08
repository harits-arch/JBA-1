import { redirect } from "next/navigation";

import { getCurrentUserFromSession } from "@/lib/auth/session";

export async function requireAdminUser() {
  const user = await getCurrentUserFromSession();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/class/register");
  }

  return user;
}
