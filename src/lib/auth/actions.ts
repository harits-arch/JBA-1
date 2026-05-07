"use server";

import { redirect } from "next/navigation";

import { getDecodedSessionToken } from "@/lib/auth/session";
import { profileSchema } from "@/lib/auth/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ProfileFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export async function completeProfileAction(
  _previousState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const decodedToken = await getDecodedSessionToken();

  if (!decodedToken) {
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
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: existingUser, error: readError } = await supabase
    .from("users")
    .select("id, role")
    .eq("firebase_uid", decodedToken.uid)
    .maybeSingle();

  if (readError) {
    return {
      status: "error",
      message: readError.message
    };
  }

  const profilePayload = {
    firebase_uid: decodedToken.uid,
    full_name: parsed.data.fullName,
    phone: decodedToken.phone_number ?? null,
    email: parsed.data.email,
    gender: parsed.data.gender,
    date_of_birth: parsed.data.dateOfBirth,
    instagram_username: parsed.data.instagramUsername,
    profile_completed: true
  };

  const { error: writeError } = existingUser
    ? await supabase
        .from("users")
        .update(profilePayload)
        .eq("id", existingUser.id)
    : await supabase.from("users").insert({
        ...profilePayload,
        role: "student"
      });

  if (writeError) {
    return {
      status: "error",
      message: writeError.message
    };
  }

  redirect("/class/register");
}
