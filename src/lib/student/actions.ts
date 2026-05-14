"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  resolveStudentActiveRegistration,
  setActiveClassCookie
} from "@/lib/student/active-class";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireStudentUser } from "@/lib/student/guards";
import {
  uploadAfterPhoto,
  uploadBeforePhoto,
  validatePhotoUpload
} from "@/lib/student/photo-upload";
import {
  buildPostTestProgressSummary,
  getWibEntryDate,
  POST_TEST_MAX_PROGRESS_ENTRIES
} from "@/lib/student/post-test-progress";
import {
  getClassTrainersForStudent,
  getStudentPostTestProgressEntries,
  getStudentPostTestSubmission,
  getStudentPreTestSubmission,
  getStudentRegistrationForClass
} from "@/lib/student/queries";
import {
  classRegistrationSchema,
  femalePreTestSchema,
  malePreTestSchema,
  postTestSchema,
  requiredFemaleCommitments,
  requiredMaleCommitments,
  validateRequiredCommitments,
  type StudentFormState
} from "@/lib/student/schema";

export async function registerForClassAction(
  _previousState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const user = await requireStudentUser();
  const values = {
    classCode: String(formData.get("classCode") ?? "")
  };
  const parsed = classRegistrationSchema.safeParse({
    classCode: formData.get("classCode")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Masukkan kode kelas yang valid.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("*")
    .eq("class_code", parsed.data.classCode)
    .in("status", ["draft", "active"])
    .maybeSingle();

  if (classError) {
    return {
      status: "error",
      message: classError.message,
      values
    };
  }

  if (!classData) {
    return {
      status: "error",
      message: "Kode kelas tidak ditemukan atau kelas sudah tidak aktif.",
      values
    };
  }

  const existingForClass = await getStudentRegistrationForClass(
    user.id,
    classData.id
  );

  if (existingForClass) {
    await setActiveClassCookie(classData.id);
    revalidatePath("/class/register");
    revalidatePath("/student/dashboard");
    redirect("/student/dashboard");
  }

  const { error: registrationError } = await supabase
    .from("class_registrations")
    .insert({
      user_id: user.id,
      class_id: classData.id
    });

  if (registrationError && registrationError.code !== "23505") {
    return {
      status: "error",
      message: registrationError.message,
      values
    };
  }

  await setActiveClassCookie(classData.id);

  revalidatePath("/class/register");
  revalidatePath("/student/dashboard");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  redirect("/student/dashboard");
}

export async function switchActiveClassAction(formData: FormData) {
  const user = await requireStudentUser();
  const classId = String(formData.get("classId") ?? "");
  const registration = await getStudentRegistrationForClass(user.id, classId);

  if (!registration) {
    redirect("/student/dashboard");
  }

  await setActiveClassCookie(classId);
  revalidatePath("/student/dashboard");
  revalidatePath("/pre-test");
  revalidatePath("/post-test");
  revalidatePath("/waiting");
  redirect("/student/dashboard");
}

export async function submitPreTestAction(
  _previousState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const user = await requireStudentUser();
  const values = getPreTestFormValues(formData);

  if (!user.gender) {
    redirect("/onboarding");
  }

  const classId = String(formData.get("classId") ?? "");
  const gender = user.gender;
  const commitments = formData
    .getAll("commitments")
    .map((commitment) => String(commitment).trim());
  const obstacles = formData.getAll("obstacles").map(String);
  const beforePhoto = formData.get("beforePhoto");
  const photoFile = beforePhoto instanceof File ? beforePhoto : null;
  const photoError = validatePhotoUpload(photoFile);
  const requiredCommitments =
    gender === "female" ? requiredFemaleCommitments : requiredMaleCommitments;

  const missingCommitments = requiredCommitments.filter(
    (commitment) => !commitments.includes(commitment)
  );

  if (photoError || !photoFile || missingCommitments.length > 0) {
    return {
      status: "error",
      message:
        photoError ??
        `Mohon centang semua komitmen wajib. Belum dicentang: ${missingCommitments.join(", ")}.`,
      values
    };
  }

  const basePayload = {
    classId,
    gender,
    groomingFrequency: formData.get("groomingFrequency"),
    expectations: formData.get("expectations"),
    obstacles,
    obstacleExplanation: formData.get("obstacleExplanation"),
    commitments
  };

  if (gender === "female") {
    const parsed = femalePreTestSchema.safeParse({
      ...basePayload,
      femaleActivities: formData.getAll("femaleActivities").map(String)
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: summarizeFieldErrors(parsed.error.flatten().fieldErrors),
        fieldErrors: parsed.error.flatten().fieldErrors,
        values
      };
    }

    const readyState = await ensurePreTestCanBeSubmitted(user.id, classId);

    if (readyState) {
      return readyState;
    }

    const beforePhotoPath = await uploadBeforePhoto({
      file: photoFile,
      classId,
      userId: user.id
    });

    const { error } = await createSupabaseAdminClient()
      .from("pre_test_submissions")
      .insert({
        user_id: user.id,
        class_id: classId,
        gender: "female",
        grooming_frequency: parsed.data.groomingFrequency,
        expectations: parsed.data.expectations,
        obstacles: parsed.data.obstacles,
        obstacle_explanation: parsed.data.obstacleExplanation,
        female_activities: parsed.data.femaleActivities,
        commitments: Object.fromEntries(
          parsed.data.commitments.map((commitment) => [commitment, true])
        ),
        answers: {
          femaleActivities: parsed.data.femaleActivities
        },
        before_photo_path: beforePhotoPath
      });

    if (error) {
      return {
        status: "error",
        message: error.message,
        values
      };
    }

  } else {
    const parsed = malePreTestSchema.safeParse({
      ...basePayload,
      maleHabits: formData.getAll("maleHabits").map(String),
      maleSkinType: formData.get("maleSkinType"),
      maleSocialMediaWilling: formData.get("maleSocialMediaWilling"),
      maleUploadTimeline: formData.get("maleUploadTimeline")
    });

    if (!parsed.success) {
      return {
        status: "error",
        message: summarizeFieldErrors(parsed.error.flatten().fieldErrors),
        fieldErrors: parsed.error.flatten().fieldErrors,
        values
      };
    }

    const readyState = await ensurePreTestCanBeSubmitted(user.id, classId);

    if (readyState) {
      return readyState;
    }

    const beforePhotoPath = await uploadBeforePhoto({
      file: photoFile,
      classId,
      userId: user.id
    });

    const { error } = await createSupabaseAdminClient()
      .from("pre_test_submissions")
      .insert({
        user_id: user.id,
        class_id: classId,
        gender: "male",
        grooming_frequency: parsed.data.groomingFrequency,
        expectations: parsed.data.expectations,
        obstacles: parsed.data.obstacles,
        obstacle_explanation: parsed.data.obstacleExplanation,
        male_habits: parsed.data.maleHabits,
        male_skin_type: parsed.data.maleSkinType,
        male_social_media_willing:
          parsed.data.maleSocialMediaWilling === "yes",
        male_upload_timeline: parsed.data.maleUploadTimeline,
        commitments: Object.fromEntries(
          parsed.data.commitments.map((commitment) => [commitment, true])
        ),
        answers: {
          maleHabits: parsed.data.maleHabits,
          maleSkinType: parsed.data.maleSkinType,
          maleSocialMediaWilling: parsed.data.maleSocialMediaWilling,
          maleUploadTimeline: parsed.data.maleUploadTimeline
        },
        before_photo_path: beforePhotoPath
      });

    if (error) {
      return {
        status: "error",
        message: error.message,
        values
      };
    }

  }

  revalidatePath("/pre-test");
  revalidatePath("/waiting");
  revalidatePath("/student/dashboard");
  revalidatePath("/admin/gallery");
  redirect("/student/dashboard");
}

export async function submitPostTestAction(
  _previousState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const user = await requireStudentUser();
  const classId = String(formData.get("classId") ?? "");
  const values = getPostTestFormValues(formData);
  const afterPhoto = formData.get("afterPhoto");
  const photoFile = afterPhoto instanceof File ? afterPhoto : null;
  const photoError = validatePhotoUpload(photoFile, "Foto after");

  if (photoError || !photoFile) {
    return {
      status: "error",
      message: photoError ?? "Foto after wajib diunggah.",
      values
    };
  }

  const registration = await resolveStudentActiveRegistration(user.id);

  if (!registration?.classes || registration.class_id !== classId) {
    redirect("/student/dashboard");
  }

  if (!registration.classes.post_test_open) {
    redirect("/student/dashboard");
  }

  const preTestSubmission = await getStudentPreTestSubmission(user.id, classId);

  if (!preTestSubmission) {
    redirect("/pre-test");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existingPostTest, error: existingError } = await supabase
    .from("post_test_submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("class_id", classId)
    .maybeSingle();

  if (existingError) {
    return {
      status: "error",
      message: existingError.message,
      values
    };
  }

  if (existingPostTest) {
    redirect("/post-test");
  }

  const trainers = await getClassTrainersForStudent(classId);
  const trainerRatings = trainers.map((trainer) => ({
    trainerId: trainer.id,
    rating: formData.get(`trainerRating:${trainer.id}`)
  }));
  const parsed = postTestSchema.safeParse({
    classId,
    likedMost: formData.get("likedMost"),
    improvementFeedback: formData.get("improvementFeedback"),
    nextSteps: formData.get("nextSteps"),
    recommendation: formData.get("recommendation"),
    recommendationTarget: formData.get("recommendationTarget"),
    testimonial: formData.get("testimonial"),
    contentConsent: formData.get("contentConsent"),
    trainerRatings
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Mohon periksa kembali kolom yang ditandai.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values
    };
  }

  const afterPhotoPath = await uploadAfterPhoto({
    file: photoFile,
    classId,
    userId: user.id
  });
  const { data: postTestSubmission, error: postTestError } = await supabase
    .from("post_test_submissions")
    .insert({
      user_id: user.id,
      class_id: classId,
      after_photo_path: afterPhotoPath,
      liked_most: parsed.data.likedMost,
      improvement_feedback: parsed.data.improvementFeedback,
      next_steps: parsed.data.nextSteps,
      recommendation: parsed.data.recommendation,
      recommendation_target: parsed.data.recommendationTarget || null,
      testimonial: parsed.data.testimonial,
      content_consent: parsed.data.contentConsent === "yes",
      answers: {
        trainerRatings: parsed.data.trainerRatings,
        contentConsent: parsed.data.contentConsent
      }
    })
    .select("id")
    .single();

  if (postTestError) {
    return {
      status: "error",
      message: postTestError.message,
      values
    };
  }

  const { error: ratingsError } = await supabase.from("trainer_ratings").insert(
    parsed.data.trainerRatings.map((trainerRating) => ({
      post_test_submission_id: postTestSubmission.id,
      trainer_id: trainerRating.trainerId,
      rating: trainerRating.rating
    }))
  );

  if (ratingsError) {
    return {
      status: "error",
      message: ratingsError.message,
      values
    };
  }

  revalidatePath("/post-test");
  revalidatePath("/waiting");
  revalidatePath("/student/dashboard");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/classes");
  redirect("/post-test");
}

export async function submitPostTestProgressAction(
  _previousState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const user = await requireStudentUser();
  const classId = String(formData.get("classId") ?? "");
  const afterPhoto = formData.get("afterPhoto");
  const photoFile = afterPhoto instanceof File ? afterPhoto : null;
  const photoError = validatePhotoUpload(photoFile, "Foto progress");

  if (photoError || !photoFile) {
    return {
      status: "error",
      message: photoError ?? "Foto progress wajib diunggah."
    };
  }

  const gateError = await ensurePostTestProgressCanBeSubmitted(user.id, classId);

  if (gateError) {
    return gateError;
  }

  const [initialSubmission, progressEntries] = await Promise.all([
    getStudentPostTestSubmission(user.id, classId),
    getStudentPostTestProgressEntries(user.id, classId)
  ]);

  if (!initialSubmission) {
    redirect("/post-test");
  }

  const summary = buildPostTestProgressSummary({
    initialSubmission,
    progressEntries
  });

  if (summary.isComplete) {
    return {
      status: "error",
      message: "Kamu sudah menyelesaikan 14 kali submission Post-Test."
    };
  }

  if (!summary.canSubmitToday) {
    return {
      status: "error",
      message: "Kamu sudah mengirim foto hari ini. Coba lagi besok (WIB)."
    };
  }

  if (progressEntries.length >= POST_TEST_MAX_PROGRESS_ENTRIES) {
    return {
      status: "error",
      message: "Batas 14 kali submission Post-Test sudah tercapai."
    };
  }

  const entryDate = getWibEntryDate();
  const afterPhotoPath = await uploadAfterPhoto({
    file: photoFile,
    classId,
    userId: user.id,
    entryDate
  });

  const supabase = createSupabaseAdminClient();
  const { error: insertError } = await supabase
    .from("post_test_progress_entries")
    .insert({
      user_id: user.id,
      class_id: classId,
      after_photo_path: afterPhotoPath,
      entry_date: entryDate
    });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        status: "error",
        message: "Kamu sudah mengirim foto hari ini. Coba lagi besok (WIB)."
      };
    }

    if (insertError.code === "42P01") {
      return {
        status: "error",
        message:
          "Fitur progress harian belum aktif di database. Hubungi admin JBA."
      };
    }

    return {
      status: "error",
      message: insertError.message
    };
  }

  revalidatePath("/post-test");
  revalidatePath("/waiting");
  revalidatePath("/student/dashboard");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/classes");
  redirect("/post-test");
}

async function ensurePostTestProgressCanBeSubmitted(
  userId: string,
  classId: string
): Promise<StudentFormState | null> {
  const registration = await resolveStudentActiveRegistration(userId);

  if (!registration?.classes || registration.class_id !== classId) {
    redirect("/student/dashboard");
  }

  if (!registration.classes.post_test_open) {
    redirect("/student/dashboard");
  }

  const preTestSubmission = await getStudentPreTestSubmission(userId, classId);

  if (!preTestSubmission) {
    redirect("/pre-test");
  }

  return null;
}

async function ensurePreTestCanBeSubmitted(
  userId: string,
  classId: string
): Promise<StudentFormState | null> {
  const registration = await resolveStudentActiveRegistration(userId);

  if (!registration || registration.class_id !== classId) {
    redirect("/student/dashboard");
  }

  const supabase = createSupabaseAdminClient();
  const { data: existingSubmission, error: existingError } = await supabase
    .from("pre_test_submissions")
    .select("id")
    .eq("user_id", userId)
    .eq("class_id", classId)
    .maybeSingle();

  if (existingError) {
    return {
      status: "error",
      message: existingError.message
    };
  }

  if (existingSubmission) {
    redirect("/student/dashboard");
  }

  return null;
}

function summarizeFieldErrors(fieldErrors: Partial<Record<string, string[]>>) {
  const messages = Object.entries(fieldErrors)
    .flatMap(([field, errors]) =>
      (errors ?? []).map((error) => `${formatFieldName(field)}: ${error}`)
    )
    .filter(Boolean);

  return messages.length > 0
    ? messages.join(" ")
    : "Mohon periksa kembali kolom yang ditandai.";
}

function formatFieldName(field: string) {
  const labels: Record<string, string> = {
    groomingFrequency: "Frekuensi grooming",
    expectations: "Ekspektasi",
    obstacles: "Kendala",
    obstacleExplanation: "Penjelasan kendala",
    femaleActivities: "Aktivitas",
    maleHabits: "Rutinitas grooming",
    maleSkinType: "Kondisi kulit",
    maleSocialMediaWilling: "Kesediaan media sosial",
    maleUploadTimeline: "Timeline upload"
  };

  return labels[field] ?? field;
}

function getPreTestFormValues(formData: FormData) {
  return {
    classId: String(formData.get("classId") ?? ""),
    groomingFrequency: String(formData.get("groomingFrequency") ?? ""),
    expectations: String(formData.get("expectations") ?? ""),
    obstacles: formData.getAll("obstacles").map(String),
    obstacleExplanation: String(formData.get("obstacleExplanation") ?? ""),
    femaleActivities: formData.getAll("femaleActivities").map(String),
    maleHabits: formData.getAll("maleHabits").map(String),
    maleSkinType: String(formData.get("maleSkinType") ?? ""),
    maleSocialMediaWilling: String(
      formData.get("maleSocialMediaWilling") ?? ""
    ),
    maleUploadTimeline: String(formData.get("maleUploadTimeline") ?? ""),
    commitments: formData.getAll("commitments").map(String)
  };
}

function getPostTestFormValues(formData: FormData) {
  const values: Record<string, string | string[]> = {
    classId: String(formData.get("classId") ?? ""),
    likedMost: String(formData.get("likedMost") ?? ""),
    improvementFeedback: String(formData.get("improvementFeedback") ?? ""),
    nextSteps: String(formData.get("nextSteps") ?? ""),
    recommendation: String(formData.get("recommendation") ?? ""),
    recommendationTarget: String(formData.get("recommendationTarget") ?? ""),
    testimonial: String(formData.get("testimonial") ?? ""),
    contentConsent: String(formData.get("contentConsent") ?? "")
  };

  for (const [key, value] of formData.entries()) {
    if (key.startsWith("trainerRating:") && typeof value === "string") {
      values[key] = value;
    }
  }

  return values;
}

function getPreTestFormValuesFromClassId(classId: string) {
  return {
    classId
  };
}
