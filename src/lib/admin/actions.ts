"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { generateClassCode, normalizeClassCode } from "@/lib/admin/class-code";
import { requireAdminUser } from "@/lib/admin/guards";
import {
  adminStudentFormSchema,
  classFormSchema,
  deleteClassSchema,
  deleteStudentSchema,
  deleteTrainerSchema,
  togglePostTestSchema,
  trainerFormSchema,
  updateClassSchema,
  updateTrainerSchema,
  type AdminFormState
} from "@/lib/admin/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getOptionalText(value: string | undefined) {
  return value?.trim() ? value.trim() : null;
}

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getAdminFormValues(formData: FormData, keys: string[]) {
  return Object.fromEntries(keys.map((key) => [key, getTextValue(formData, key)]));
}

export async function createClassAction(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminSession = await requireAdminUser();
  const values = getAdminFormValues(formData, [
    "clientName",
    "className",
    "classCode",
    "classDate",
    "status",
    "location",
    "notes"
  ]);
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
      message: "Mohon periksa kembali kolom yang ditandai.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values
    };
  }

  const classCode = parsed.data.classCode
    ? normalizeClassCode(parsed.data.classCode)
    : generateClassCode(parsed.data.clientName, parsed.data.classDate);

  const supabase = createSupabaseAdminClient();
  const classPayload = {
    client_name: parsed.data.clientName,
    class_name: getOptionalText(parsed.data.className),
    class_code: classCode,
    class_date: parsed.data.classDate,
    status: parsed.data.status,
    location: getOptionalText(parsed.data.location),
    notes: getOptionalText(parsed.data.notes),
    created_by: null
  };
  const { data: createdClass, error } = await supabase
    .from("classes")
    .insert(classPayload)
    .select("id")
    .single();

  if (error?.code === "23502" && error.message.includes('"name"')) {
    const { data: legacyCreatedClass, error: legacyError } = await supabase
      .from("classes")
      .insert({
        ...classPayload,
        name: parsed.data.clientName
      })
      .select("id")
      .single();

    if (!legacyError && legacyCreatedClass) {
      revalidatePath("/admin");
      revalidatePath("/admin/classes");
      redirect(`/admin/classes/${legacyCreatedClass.id}`);
    }

    return {
      status: "error",
      message: legacyError?.message ?? "Gagal membuat kelas.",
      values
    };
  }

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Kode kelas sudah ada. Mohon gunakan kode lain."
          : error.message,
      values
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  redirect(`/admin/classes/${createdClass.id}`);
}

export async function updateClassAction(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminSession = await requireAdminUser();
  const values = getAdminFormValues(formData, [
    "classId",
    "clientName",
    "className",
    "classCode",
    "classDate",
    "status",
    "location",
    "notes"
  ]);
  const parsed = updateClassSchema.safeParse({
    classId: formData.get("classId"),
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
      message: "Mohon periksa kembali kolom yang ditandai.",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values
    };
  }

  const classCode = normalizeClassCode(parsed.data.classCode);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("classes")
    .update({
      client_name: parsed.data.clientName,
      class_name: getOptionalText(parsed.data.className),
      class_code: classCode,
      class_date: parsed.data.classDate,
      status: parsed.data.status,
      location: getOptionalText(parsed.data.location),
      notes: getOptionalText(parsed.data.notes)
    })
    .eq("id", parsed.data.classId);

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Kode kelas sudah dipakai kelas lain."
          : error.message,
      values
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${parsed.data.classId}`);
  revalidatePath(`/admin/classes/${parsed.data.classId}/edit`);

  redirect(`/admin/classes/${parsed.data.classId}`);
}

export async function deleteClassAction(formData: FormData) {
  await requireAdminUser();
  const parsed = deleteClassSchema.safeParse({
    classId: formData.get("classId")
  });

  if (!parsed.success) {
    throw new Error("ID kelas tidak valid.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("classes")
    .delete()
    .eq("id", parsed.data.classId);

  if (error) {
    throw error;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/classes");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/feedback");
  revalidatePath("/admin/trainers-database");
  redirect("/admin/classes");
}

export async function updateStudentAdminAction(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminSession = await requireAdminUser();
  const values = getAdminFormValues(formData, [
    "userId",
    "fullName",
    "phone",
    "email",
    "gender",
    "instagramUsername",
    "dateOfBirth"
  ]);
  const parsed = adminStudentFormSchema.safeParse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    gender: formData.get("gender"),
    instagramUsername: formData.get("instagramUsername"),
    dateOfBirth: formData.get("dateOfBirth")
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
  const { error } = await supabase
    .from("users")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      gender: parsed.data.gender,
      instagram_username: parsed.data.instagramUsername,
      date_of_birth: parsed.data.dateOfBirth
    })
    .eq("id", parsed.data.userId)
    .eq("role", "student");

  if (error) {
    return {
      status: "error",
      message:
        error.code === "23505"
          ? "Nomor telepon atau email bentrok dengan student lain."
          : error.message,
      values
    };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${parsed.data.userId}/edit`);
  revalidatePath("/admin/gallery");
  redirect("/admin/students");
}

export async function deleteStudentAdminAction(formData: FormData) {
  await requireAdminUser();
  const parsed = deleteStudentSchema.safeParse({
    userId: formData.get("userId")
  });

  if (!parsed.success) {
    throw new Error("ID siswa tidak valid.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", parsed.data.userId)
    .eq("role", "student");

  if (error) {
    throw error;
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/feedback");
  redirect("/admin/students");
}

export async function updateTrainerAction(
  _previousState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const adminSession = await requireAdminUser();
  const values = getAdminFormValues(formData, [
    "trainerId",
    "classId",
    "name",
    "role",
    "displayOrder"
  ]);
  const parsed = updateTrainerSchema.safeParse({
    trainerId: formData.get("trainerId"),
    classId: formData.get("classId"),
    name: formData.get("name"),
    role: formData.get("role"),
    displayOrder: formData.get("displayOrder") ?? 0
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
  const { error } = await supabase
    .from("trainers")
    .update({
      class_id: parsed.data.classId,
      name: parsed.data.name,
      role: parsed.data.role,
      display_order: parsed.data.displayOrder
    })
    .eq("id", parsed.data.trainerId);

  if (error) {
    return {
      status: "error",
      message: error.message,
      values
    };
  }

  revalidatePath(`/admin/classes/${parsed.data.classId}`);
  revalidatePath("/admin/trainers-database");
  revalidatePath(`/admin/trainers-database/${parsed.data.trainerId}/edit`);

  redirect("/admin/trainers-database");
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
  const values = getAdminFormValues(formData, [
    "classId",
    "name",
    "role",
    "displayOrder"
  ]);
  const parsed = trainerFormSchema.safeParse({
    classId: formData.get("classId"),
    name: formData.get("name"),
    role: formData.get("role"),
    displayOrder: formData.get("displayOrder") ?? 0
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
  const { error } = await supabase.from("trainers").insert({
    class_id: parsed.data.classId,
    name: parsed.data.name,
    role: parsed.data.role,
    display_order: parsed.data.displayOrder
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
      values
    };
  }

  revalidatePath(`/admin/classes/${parsed.data.classId}`);
  revalidatePath("/admin/trainers-database");

  return {
    status: "success",
    message: "Trainer berhasil ditambahkan."
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
  revalidatePath("/admin/trainers-database");
}
