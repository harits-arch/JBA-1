"use server";

import { redirect } from "next/navigation";

import { getCurrentUserFromSession } from "@/lib/auth/session";
import { profileSchema } from "@/lib/auth/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProfileFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};

export async function completeProfileAction(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const currentUser = await getCurrentUserFromSession();
  const values = {
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    gender: String(formData.get("gender") ?? ""),
    dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
    instagramUsername: String(formData.get("instagramUsername") ?? "")
  };

  if (!currentUser) {
    redirect("/login");
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    gender: formData.get("gender"),
    dateOfBirth: formData.get("dateOfBirth"),
    instagramUsername: formData.get("instagramUsername")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Mohon periksa kembali kolom yang ditandai.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values
    };
  }

  const supabase = createSupabaseAdminClient();
  const profilePayload = {
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    gender: parsed.data.gender,
    date_of_birth: parsed.data.dateOfBirth,
    instagram_username: parsed.data.instagramUsername,
    profile_completed: true
  };

  const { error: writeError } = await supabase
    .from("users")
    .update(profilePayload)
    .eq("id", currentUser.id);

  if (writeError) {
    return {
      status: "error",
      message: writeError.message,
      values
    };
  }

  redirect("/student/dashboard");
}
