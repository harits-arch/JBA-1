import { notFound } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type ClassRow = Database["public"]["Tables"]["classes"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];
type PreTestRow = Database["public"]["Tables"]["pre_test_submissions"]["Row"];
type PostTestRow = Database["public"]["Tables"]["post_test_submissions"]["Row"];
type TrainerRatingRow = Database["public"]["Tables"]["trainer_ratings"]["Row"];

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

export type AdminSubmissionStudent = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  gender: string | null;
  instagram_username: string | null;
};

export type AdminPreTestSubmission = PreTestRow & {
  users: AdminSubmissionStudent | null;
};

export type AdminPostTestSubmission = PostTestRow & {
  users: AdminSubmissionStudent | null;
  trainer_ratings: Array<
    TrainerRatingRow & {
      trainers: Pick<TrainerRow, "id" | "name" | "role"> | null;
    }
  >;
};

type PostTestProgressRow =
  Database["public"]["Tables"]["post_test_progress_entries"]["Row"];

export type AdminPostTestProgressEntry = PostTestProgressRow & {
  users: AdminSubmissionStudent | null;
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

export async function getClassSubmissions(classId: string) {
  const supabase = createSupabaseAdminClient();
  const [
    { data: preTests, error: preTestError },
    { data: postTests, error: postTestError },
    { data: progressEntries, error: progressError }
  ] = await Promise.all([
    supabase
      .from("pre_test_submissions")
      .select(
        `
        *,
        users(
          id,
          full_name,
          phone,
          email,
          gender,
          instagram_username
        )
      `
      )
      .eq("class_id", classId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("post_test_submissions")
      .select(
        `
        *,
        users(
          id,
          full_name,
          phone,
          email,
          gender,
          instagram_username
        ),
        trainer_ratings(
          *,
          trainers(id, name, role)
        )
      `
      )
      .eq("class_id", classId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("post_test_progress_entries")
      .select(
        `
        *,
        users(
          id,
          full_name,
          phone,
          email,
          gender,
          instagram_username
        )
      `
      )
      .eq("class_id", classId)
      .order("entry_date", { ascending: true })
  ]);

  const error = preTestError ?? postTestError ?? progressError;

  if (error) {
    throw error;
  }

  return {
    preTests: (preTests ?? []) as unknown as AdminPreTestSubmission[],
    postTests: (postTests ?? []) as unknown as AdminPostTestSubmission[],
    progressEntries: (progressEntries ??
      []) as unknown as AdminPostTestProgressEntry[]
  };
}

export async function createSubmissionPhotoUrl(path: string | null) {
  if (!path) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from("submissions")
    .createSignedUrl(path, 60 * 60);

  if (!error) {
    return data.signedUrl;
  }

  const { data: fallbackData, error: fallbackError } = await supabase.storage
    .from("submission-photos")
    .createSignedUrl(path, 60 * 60);

  if (fallbackError) {
    throw fallbackError;
  }

  return fallbackData.signedUrl;
}

export type AdminStudentDirectoryRow = {
  userId: string;
  fullName: string | null;
  phone: string | null;
  /** Human-readable class labels, e.g. "Client – CODE" */
  classes: string[];
};

type ClassEmbed = {
  client_name: string | null;
  class_code: string | null;
} | null;

type RegistrationEmbed = {
  class_id: string;
  classes: ClassEmbed;
};

type UserWithRegs = {
  id: string;
  full_name: string | null;
  phone: string | null;
  class_registrations: RegistrationEmbed[] | null;
};

export async function getAllStudentsDirectory(): Promise<AdminStudentDirectoryRow[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      full_name,
      phone,
      class_registrations(
        class_id,
        classes(client_name, class_code)
      )
    `
    )
    .eq("role", "student")
    .order("full_name", { ascending: true, nullsFirst: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as UserWithRegs[];

  return rows.map((user) => {
    const regs = user.class_registrations ?? [];
    const classes = regs.map((r) => {
      const c = r.classes;
      const name = c?.client_name?.trim() || "Kelas";
      const code = c?.class_code?.trim() || "";
      return code ? `${name} – ${code}` : name;
    });

    return {
      userId: user.id,
      fullName: user.full_name,
      phone: user.phone,
      classes
    };
  });
}

export type AdminGlobalGalleryRow = {
  id: string;
  studentName: string;
  phone: string | null;
  classLabel: string;
  beforePhotoUrl: string | null;
  afterPhotoUrl: string | null;
};

export async function getGlobalGalleryRows(): Promise<AdminGlobalGalleryRow[]> {
  const supabase = createSupabaseAdminClient();
  const [{ data: preRows, error: preErr }, { data: postRows, error: postErr }] =
    await Promise.all([
      supabase
        .from("pre_test_submissions")
        .select(
          `
        user_id,
        class_id,
        before_photo_path,
        users(full_name, phone),
        classes(client_name, class_code)
      `
        )
        .order("submitted_at", { ascending: false }),
      supabase
        .from("post_test_submissions")
        .select(
          `
        user_id,
        class_id,
        after_photo_path,
        users(full_name, phone),
        classes(client_name, class_code)
      `
        )
        .order("submitted_at", { ascending: false })
    ]);

  const err = preErr ?? postErr;
  if (err) {
    throw err;
  }

  type SubRow = {
    user_id: string;
    class_id: string;
    before_photo_path?: string;
    after_photo_path?: string;
    users: { full_name: string | null; phone: string | null } | null;
    classes: ClassEmbed;
  };

  const merged = new Map<
    string,
    {
      userId: string;
      classId: string;
      studentName: string;
      phone: string | null;
      classLabel: string;
      beforePath: string | null;
      afterPath: string | null;
    }
  >();

  const classLabelFrom = (c: ClassEmbed) => {
    const name = c?.client_name?.trim() || "Kelas";
    const code = c?.class_code?.trim() || "";
    return code ? `${name} – ${code}` : name;
  };

  for (const raw of (preRows ?? []) as unknown as SubRow[]) {
    const key = `${raw.user_id}:${raw.class_id}`;
    const prev = merged.get(key);
    merged.set(key, {
      userId: raw.user_id,
      classId: raw.class_id,
      studentName: raw.users?.full_name ?? "Student Tanpa Nama",
      phone: raw.users?.phone ?? null,
      classLabel: classLabelFrom(raw.classes),
      beforePath: raw.before_photo_path ?? null,
      afterPath: prev?.afterPath ?? null
    });
  }

  for (const raw of (postRows ?? []) as unknown as SubRow[]) {
    const key = `${raw.user_id}:${raw.class_id}`;
    const prev = merged.get(key);
    merged.set(key, {
      userId: raw.user_id,
      classId: raw.class_id,
      studentName:
        prev?.studentName ?? raw.users?.full_name ?? "Student Tanpa Nama",
      phone: prev?.phone ?? raw.users?.phone ?? null,
      classLabel: prev?.classLabel ?? classLabelFrom(raw.classes),
      beforePath: prev?.beforePath ?? null,
      afterPath: raw.after_photo_path ?? null
    });
  }

  const entries = [...merged.values()].filter(
    (e) => e.beforePath || e.afterPath
  );

  const withUrls: AdminGlobalGalleryRow[] = await Promise.all(
    entries.map(async (e) => {
      const [beforePhotoUrl, afterPhotoUrl] = await Promise.all([
        createSubmissionPhotoUrl(e.beforePath),
        createSubmissionPhotoUrl(e.afterPath)
      ]);

      return {
        id: `${e.userId}-${e.classId}`,
        studentName: e.studentName,
        phone: e.phone,
        classLabel: e.classLabel,
        beforePhotoUrl,
        afterPhotoUrl
      };
    })
  );

  return withUrls;
}

export type GlobalFeedbackItem = {
  id: string;
  studentName: string;
  classLabel: string;
  submittedAt: string;
  likedMost: string | null;
  improvementFeedback: string | null;
  nextSteps: string | null;
  testimonial: string | null;
  trainerRatings: Array<{
    id: string;
    rating: number;
    trainerName: string;
    trainerRole: string;
  }>;
};

export async function getGlobalFeedbackItems(): Promise<GlobalFeedbackItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data: submissions, error } = await supabase
    .from("post_test_submissions")
    .select(
      `
      id,
      submitted_at,
      liked_most,
      improvement_feedback,
      next_steps,
      testimonial,
      users(full_name),
      classes(client_name, class_code),
      trainer_ratings(
        id,
        rating,
        trainers(id, name, role)
      )
    `
    )
    .order("submitted_at", { ascending: false });

  if (error) {
    throw error;
  }

  type RawPost = {
    id: string;
    submitted_at: string;
    liked_most: string | null;
    improvement_feedback: string | null;
    next_steps: string | null;
    testimonial: string | null;
    users: { full_name: string | null } | null;
    classes: ClassEmbed;
    trainer_ratings: Array<
      TrainerRatingRow & {
        trainers: Pick<TrainerRow, "id" | "name" | "role"> | null;
      }
    >;
  };

  return ((submissions ?? []) as unknown as RawPost[]).map((submission) => {
    const c = submission.classes;
    const name = c?.client_name?.trim() || "Kelas";
    const code = c?.class_code?.trim() || "";
    const classLabel = code ? `${name} – ${code}` : name;

    return {
      id: submission.id,
      studentName: submission.users?.full_name ?? "Student Tanpa Nama",
      classLabel,
      submittedAt: submission.submitted_at,
      likedMost: submission.liked_most,
      improvementFeedback: submission.improvement_feedback,
      nextSteps: submission.next_steps,
      testimonial: submission.testimonial,
      trainerRatings: submission.trainer_ratings.map((rating) => ({
        id: rating.id,
        rating: rating.rating,
        trainerName: rating.trainers?.name ?? "Trainer",
        trainerRole: rating.trainers?.role ?? "-"
      }))
    };
  });
}

export type AdminTrainerDirectoryRow = {
  id: string;
  name: string;
  role: string;
  display_order: number;
  class_id: string;
  classes: { client_name: string | null; class_code: string | null } | null;
};

export async function getAllTrainersDirectory(): Promise<
  AdminTrainerDirectoryRow[]
> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trainers")
    .select(
      `
      id,
      name,
      role,
      display_order,
      class_id,
      classes(client_name, class_code)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AdminTrainerDirectoryRow[];
}

export async function getStudentForAdminEdit(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .eq("role", "student")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getTrainerForAdminEdit(trainerId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trainers")
    .select(
      `
      *,
      classes(client_name, class_code)
    `
    )
    .eq("id", trainerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as (TrainerRow & {
    classes: { client_name: string | null; class_code: string | null } | null;
  }) | null;
}

export async function getClassRowForEdit(classId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", classId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ClassRow | null;
}
