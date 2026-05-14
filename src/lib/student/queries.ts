import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  buildPostTestProgressSummary,
  type PostTestProgressSummary
} from "@/lib/student/post-test-progress";
import { resolveStudentActiveRegistration } from "@/lib/student/active-class";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type RegistrationRow =
  Database["public"]["Tables"]["class_registrations"]["Row"];
type PreTestRow = Database["public"]["Tables"]["pre_test_submissions"]["Row"];
type PostTestRow = Database["public"]["Tables"]["post_test_submissions"]["Row"];
type PostTestProgressRow =
  Database["public"]["Tables"]["post_test_progress_entries"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];

export type StudentRegistrationWithClass = RegistrationRow & {
  classes: ClassRow | null;
};

export type StudentDashboardData = {
  registrations: StudentRegistrationWithClass[];
  registration: StudentRegistrationWithClass | null;
  preTest: PreTestRow | null;
  postTest: PostTestRow | null;
  postTestProgress: PostTestProgressRow[];
  postTestSummary: PostTestProgressSummary | null;
  trainers: TrainerRow[];
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
  latestProgressPhotoUrl: string | null;
};

export async function getStudentRegistrations(userId: string) {
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
    .order("registered_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (registrations ?? []) as unknown as StudentRegistrationWithClass[];
}

/** @deprecated Use resolveStudentActiveRegistration from active-class.ts */
export async function getStudentCurrentRegistration(userId: string) {
  const registrations = await getStudentRegistrations(userId);
  return registrations[0] ?? null;
}

export async function getStudentRegistrationForClass(
  userId: string,
  classId: string
) {
  const registrations = await getStudentRegistrations(userId);
  return registrations.find((registration) => registration.class_id === classId) ?? null;
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

export async function getStudentPostTestProgressEntries(
  userId: string,
  classId: string
) {
  const supabase = createSupabaseAdminClient();
  const { data: entries, error } = await supabase
    .from("post_test_progress_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("class_id", classId)
    .order("entry_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (entries ?? []) as PostTestProgressRow[];
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

export async function getStudentDashboardData(
  userId: string
): Promise<StudentDashboardData> {
  const registrations = await getStudentRegistrations(userId);
  const registration = await resolveStudentActiveRegistration(userId);

  if (!registration?.classes) {
    return {
      registrations,
      registration,
      preTest: null,
      postTest: null,
      postTestProgress: [],
      postTestSummary: null,
      trainers: [],
      beforePhotoUrl: null,
      afterPhotoUrl: null,
      latestProgressPhotoUrl: null
    };
  }

  const [preTest, postTest, postTestProgress, trainers] = await Promise.all([
    getStudentPreTestSubmission(userId, registration.class_id),
    getStudentPostTestSubmission(userId, registration.class_id),
    getStudentPostTestProgressEntries(userId, registration.class_id),
    getClassTrainersForStudent(registration.class_id)
  ]);

  const postTestSummary = buildPostTestProgressSummary({
    initialSubmission: postTest,
    progressEntries: postTestProgress
  });

  const latestProgressPhotoPath =
    postTestProgress[postTestProgress.length - 1]?.after_photo_path ?? null;

  const [beforePhotoUrl, afterPhotoUrl, latestProgressPhotoUrl] = await Promise.all([
    createStudentPhotoUrl(preTest?.before_photo_path ?? null),
    createStudentPhotoUrl(postTest?.after_photo_path ?? null),
    createStudentPhotoUrl(latestProgressPhotoPath)
  ]);

  return {
    registrations,
    registration,
    preTest,
    postTest,
    postTestProgress,
    postTestSummary,
    trainers,
    beforePhotoUrl,
    afterPhotoUrl,
    latestProgressPhotoUrl
  };
}

async function createStudentPhotoUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from("submission-photos")
    .createSignedUrl(path, 60 * 60);

  if (error) {
    return null;
  }

  return data.signedUrl;
}
