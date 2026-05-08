import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];

export type AdminClassListItem = ClassRow & {
  trainers: { id: string }[];
  class_registrations: { id: string }[];
  pre_test_submissions: { id: string }[];
  post_test_submissions: { id: string }[];
};

export type RegisteredStudent = {
  registered_at: string;
  users: {
    id: string;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    gender: string | null;
    instagram_username: string | null;
    profile_completed: boolean;
  } | null;
};

export async function getAdminDashboardStats() {
  const supabase = createSupabaseAdminClient();
  const [
    { count: classCount, error: classError },
    { count: studentCount, error: studentError },
    { count: preTestCount, error: preTestError },
    { count: postTestCount, error: postTestError }
  ] = await Promise.all([
    supabase.from("classes").select("id", { count: "exact", head: true }),
    supabase
      .from("class_registrations")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("pre_test_submissions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("post_test_submissions")
      .select("id", { count: "exact", head: true })
  ]);

  const error = classError ?? studentError ?? preTestError ?? postTestError;

  if (error) {
    throw error;
  }

  return {
    classCount: classCount ?? 0,
    studentCount: studentCount ?? 0,
    preTestCount: preTestCount ?? 0,
    postTestCount: postTestCount ?? 0
  };
}

export async function getClassesForAdmin() {
  const supabase = createSupabaseAdminClient();
  const { data: classes, error } = await supabase
    .from("classes")
    .select(
      `
      *,
      trainers(id),
      class_registrations(id),
      pre_test_submissions(id),
      post_test_submissions(id)
    `
    )
    .order("class_date", { ascending: false });

  if (error) {
    throw error;
  }

  return (classes ?? []) as unknown as AdminClassListItem[];
}

export async function getClassDetail(classId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: classData, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!classData) {
    notFound();
  }

  const [
    { data: trainers, error: trainersError },
    { count: registeredCount, error: registeredError },
    { count: preTestCount, error: preTestError },
    { count: postTestCount, error: postTestError }
  ] = await Promise.all([
    supabase
      .from("trainers")
      .select("*")
      .eq("class_id", classId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("class_registrations")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId),
    supabase
      .from("pre_test_submissions")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId),
    supabase
      .from("post_test_submissions")
      .select("id", { count: "exact", head: true })
      .eq("class_id", classId)
  ]);

  const detailError =
    trainersError ?? registeredError ?? preTestError ?? postTestError;

  if (detailError) {
    throw detailError;
  }

  return {
    classData,
    trainers: (trainers ?? []) as TrainerRow[],
    stats: {
      registeredCount: registeredCount ?? 0,
      preTestCount: preTestCount ?? 0,
      postTestCount: postTestCount ?? 0
    }
  };
}

export async function getRegisteredStudents(classId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: registrations, error } = await supabase
    .from("class_registrations")
    .select(
      `
      registered_at,
      users(
        id,
        full_name,
        phone,
        email,
        gender,
        instagram_username,
        profile_completed
      )
    `
    )
    .eq("class_id", classId)
    .order("registered_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (registrations ?? []) as unknown as RegisteredStudent[];
}
