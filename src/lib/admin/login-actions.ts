"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  createAdminSession,
  verifyInitialAdminCredentials
} from "@/lib/admin/auth";

export type AdminLoginFormState = {
  status: "idle" | "error";
  message?: string;
  values?: {
    username?: string;
  };
};

export async function adminLoginAction(
  _previousState: AdminLoginFormState,
  formData: FormData
): Promise<AdminLoginFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyInitialAdminCredentials({ username, password })) {
    return {
      status: "error",
      message: "Username atau password admin salah.",
      values: { username }
    };
  }

  await createAdminSession(username);
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
