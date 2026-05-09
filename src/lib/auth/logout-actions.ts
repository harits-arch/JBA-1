"use server";

import { redirect } from "next/navigation";

import { clearAuthSession } from "@/lib/auth/session";

export async function studentLogoutAction() {
  await clearAuthSession();
  redirect("/login");
}
