import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const maxPhotoSizeBytes = 5 * 1024 * 1024;
const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export function validatePhotoUpload(file: File | null, label = "Photo") {
  if (!file || file.size === 0) {
    return `${label} is required.`;
  }

  if (!allowedPhotoTypes.includes(file.type)) {
    return `${label} must be a JPG, PNG, or WEBP image.`;
  }

  if (file.size > maxPhotoSizeBytes) {
    return `${label} must be 5MB or smaller.`;
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
