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

export type StudentDashboardData = {
  registration: StudentRegistrationWithClass | null;
  preTest: PreTestRow | null;
  postTest: PostTestRow | null;
  trainers: TrainerRow[];
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
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

export async function getStudentDashboardData(
  userId: string
): Promise<StudentDashboardData> {
  const registration = await getStudentCurrentRegistration(userId);

  if (!registration?.classes) {
    return {
      registration,
      preTest: null,
      postTest: null,
      trainers: [],
      beforePhotoUrl: null,
      afterPhotoUrl: null
    };
  }

  const [preTest, postTest, trainers] = await Promise.all([
    getStudentPreTestSubmission(userId, registration.class_id),
    getStudentPostTestSubmission(userId, registration.class_id),
    getClassTrainersForStudent(registration.class_id)
  ]);

  const [beforePhotoUrl, afterPhotoUrl] = await Promise.all([
    createStudentPhotoUrl(preTest?.before_photo_path ?? null),
    createStudentPhotoUrl(postTest?.after_photo_path ?? null)
  ]);

  return {
    registration,
    preTest,
    postTest,
    trainers,
    beforePhotoUrl,
    afterPhotoUrl
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
