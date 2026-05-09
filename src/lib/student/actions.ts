"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireStudentUser } from "@/lib/student/guards";
import {
  uploadAfterPhoto,
  uploadBeforePhoto,
  validatePhotoUpload
} from "@/lib/student/photo-upload";
import {
  getClassTrainersForStudent,
  getStudentCurrentRegistration,
  getStudentPreTestSubmission
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
  const existingRegistration = await getStudentCurrentRegistration(user.id);

  if (existingRegistration) {
    redirect("/pre-test");
  }

  const parsed = classRegistrationSchema.safeParse({
    classCode: formData.get("classCode")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter a valid class code.",
      fieldErrors: parsed.error.flatten().fieldErrors
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
      message: classError.message
    };
  }

  if (!classData) {
    return {
      status: "error",
      message: "Class code not found or the class is no longer active."
    };
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
      message: registrationError.message
    };
  }

  revalidatePath("/class/register");
  redirect("/pre-test");
}

export async function submitPreTestAction(
  _previousState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const user = await requireStudentUser();

  if (!user.gender) {
    redirect("/onboarding");
  }

  const classId = String(formData.get("classId") ?? "");
  const gender = user.gender;
  const commitments = formData.getAll("commitments").map(String);
  const obstacles = formData.getAll("obstacles").map(String);
  const beforePhoto = formData.get("beforePhoto");
  const photoFile = beforePhoto instanceof File ? beforePhoto : null;
  const photoError = validatePhotoUpload(photoFile);
  const requiredCommitments =
    gender === "female" ? requiredFemaleCommitments : requiredMaleCommitments;

  if (
    photoError ||
    !photoFile ||
    !validateRequiredCommitments(commitments, requiredCommitments)
  ) {
    return {
      status: "error",
      message:
        photoError ??
        "Please agree to all mandatory commitments."
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
        message: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors
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
        message: error.message
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
        message: "Please check the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors
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
        message: error.message
      };
    }
  }

  revalidatePath("/pre-test");
  revalidatePath("/waiting");
  redirect("/waiting");
}

export async function submitPostTestAction(
  _previousState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const user = await requireStudentUser();
  const classId = String(formData.get("classId") ?? "");
  const afterPhoto = formData.get("afterPhoto");
  const photoFile = afterPhoto instanceof File ? afterPhoto : null;
  const photoError = validatePhotoUpload(photoFile, "After photo");

  if (photoError || !photoFile) {
    return {
      status: "error",
      message: photoError ?? "After photo is required."
    };
  }

  const registration = await getStudentCurrentRegistration(user.id);

  if (!registration?.classes || registration.class_id !== classId) {
    redirect("/class/register");
  }

  if (!registration.classes.post_test_open) {
    redirect("/waiting");
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
      message: existingError.message
    };
  }

  if (existingPostTest) {
    redirect("/waiting");
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
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
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
      message: postTestError.message
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
      message: ratingsError.message
    };
  }

  revalidatePath("/post-test");
  revalidatePath("/waiting");
  redirect("/waiting");
}

async function ensurePreTestCanBeSubmitted(
  userId: string,
  classId: string
): Promise<StudentFormState | null> {
  const registration = await getStudentCurrentRegistration(userId);

  if (!registration || registration.class_id !== classId) {
    redirect("/class/register");
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
    redirect("/waiting");
  }

  return null;
}
