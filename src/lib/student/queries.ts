import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type RegistrationRow =
  Database["public"]["Tables"]["class_registrations"]["Row"];
type PreTestRow = Database["public"]["Tables"]["pre_test_submissions"]["Row"];
type PostTestRow = Database["public"]["Tables"]["post_test_submissions"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];

export type StudentRegistrationWithClass = RegistrationRow & {
  classes: ClassRow | null;
};

export async function getStudentCurrentRegistration(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: registrations, error } = await supabase
    .from("class_registrations")
    .select(
      `
      *,
      classes(*)
    `
    )
    .eq("user_id", userId)
    .order("registered_at", { ascending: false })
    .limit(1);

  if (error) {
    throw error;
  }

  return ((registrations ?? [])[0] ??
    null) as unknown as StudentRegistrationWithClass | null;
}

export async function getStudentPreTestSubmission(
  userId: string,
  classId: string
) {
  const supabase = createSupabaseAdminClient();
  const { data: submission, error } = await supabase
    .from("pre_test_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("class_id", classId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return submission as PreTestRow | null;
}

export async function getStudentPostTestSubmission(
  userId: string,
  classId: string
) {
  const supabase = createSupabaseAdminClient();
  const { data: submission, error } = await supabase
    .from("post_test_submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("class_id", classId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return submission as PostTestRow | null;
}

export async function getClassTrainersForStudent(classId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: trainers, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("class_id", classId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (trainers ?? []) as TrainerRow[];
}
