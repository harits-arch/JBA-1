import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin/auth";

export async function requireAdminUser() {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    redirect("/admin/login");
  }

  return adminSession;
}
