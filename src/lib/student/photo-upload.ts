import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** Upper bound for the file that reaches the server (after optional client compress). */
const maxPhotoSizeBytes = 64 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export function validatePhotoUpload(file: File | null, label = "Foto") {
  if (!file || file.size === 0) {
    return `${label} wajib diunggah.`;
  }

  if (!allowedPhotoTypes.includes(file.type)) {
    return `${label} harus berupa gambar JPG, PNG, atau WEBP.`;
  }

  if (file.size > maxPhotoSizeBytes) {
    return `${label} terlalu besar (maksimal 64MB).`;
  }

  return null;
}

export async function uploadBeforePhoto({
  file,
  classId,
  userId
}: {
  file: File;
  classId: string;
  userId: string;
}) {
  return uploadSubmissionPhoto({
    file,
    classId,
    userId,
    kind: "before"
  });
}

export async function uploadAfterPhoto({
  file,
  classId,
  userId
}: {
  file: File;
  classId: string;
  userId: string;
}) {
  return uploadSubmissionPhoto({
    file,
    classId,
    userId,
    kind: "after"
  });
}

async function uploadSubmissionPhoto({
  file,
  classId,
  userId,
  kind
}: {
  file: File;
  classId: string;
  userId: string;
  kind: "before" | "after";
}) {
  const supabase = createSupabaseAdminClient();
  const extension = getExtensionForMime(file.type);
  const path = `classes/${classId}/students/${userId}/${kind}.${extension}`;
  const { error } = await supabase.storage
    .from("submission-photos")
    .upload(path, file, {
      contentType: file.type,
      upsert: true
    });

  if (error) {
    throw error;
  }

  return path;
}

function getExtensionForMime(mimeType: string) {
  if (mimeType === "image/png") {
    return "png";
  }

  if (mimeType === "image/webp") {
    return "webp";
  }

  return "jpg";
}
