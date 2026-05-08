"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateClassCode, normalizeClassCode } from "@/lib/admin/class-code";
import { requireAdminUser } from "@/lib/admin/guards";
import {
  classFormSchema,
  deleteTrainerSchema,
  togglePostTestSchema,
  trainerFormSchema,
  type AdminFormState
} from "@/lib/admin/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getOptionalText(value: string | undefined) {
  return value?.trim() ? value.trim() : null;
}

export async function createClassAction(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const admin = await requireAdminUser();
  const parsed = classFormSchema.safeParse({
    clientName: formData.get("clientName"),
    className: formData.get("className"),
    classCode: formData.get("classCode"),
    classDate: formData.get("classDate"),
    status: formData.get("status") ?? "active",
    location: formData.get("location"),
    notes: formData.get("notes")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const classCode = parsed.data.classCode
    ? normalizeClassCode(parsed.data.classCode)
    : generateClassCode(parsed.data.clientName, parsed.data.classDate);

  const supabase = createSupabaseAdminClient();
  const { data: createdClass, error } = await supabase
    .from("classes")
    .insert({
      client_name: parsed.data.clientName,
      class_name: getOptionalText(parsed.data.className),
      class_code: classCode,
      class_date: parsed.data.classDate,
      status: parsed.data.status,
      location: getOptionalText(parsed.data.location),
      notes: getOptionalText(parsed.data.notes),
      created_by: admin.id
    })
    .select("id")
    .single();

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "That class code already exists. Please choose another code."
          : error.message
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  redirect(`/admin/classes/${createdClass.id}`);
}

export async function togglePostTestAction(formData: FormData) {
  await requireAdminUser();
  const parsed = togglePostTestSchema.parse({
    classId: formData.get("classId"),
    postTestOpen: formData.get("postTestOpen")
  });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("classes")
    .update({ post_test_open: parsed.postTestOpen })
    .eq("id", parsed.classId);

  if (error) {
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${parsed.classId}`);
}

export async function addTrainerAction(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdminUser();
  const parsed = trainerFormSchema.safeParse({
    classId: formData.get("classId"),
    name: formData.get("name"),
    role: formData.get("role"),
    displayOrder: formData.get("displayOrder") ?? 0
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("trainers").insert({
    class_id: parsed.data.classId,
    name: parsed.data.name,
    role: parsed.data.role,
    display_order: parsed.data.displayOrder
  });

  if (error) {
    return {
      status: "error",
      message: error.message
    };
  }

  revalidatePath(`/admin/classes/${parsed.data.classId}`);

  return {
    status: "success",
    message: "Trainer added."
  };
}

export async function deleteTrainerAction(formData: FormData) {
  await requireAdminUser();
  const parsed = deleteTrainerSchema.parse({
    trainerId: formData.get("trainerId"),
    classId: formData.get("classId")
  });

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("trainers")
    .delete()
    .eq("id", parsed.trainerId);

  if (error) {
    throw error;
  }

  revalidatePath(`/admin/classes/${parsed.classId}`);
}
