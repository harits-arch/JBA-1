import { z } from "zod";

export type StudentFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string | string[]>;
};

export const classRegistrationSchema = z.object({
  classCode: z
    .string()
    .trim()
    .min(3, "Kode kelas wajib diisi.")
    .transform((value) => value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
});

const requiredText = (message: string) =>
  z.preprocess(
    (value) => (value === null ? "" : value),
    z.string().trim().min(1, message)
  );

const requiredLongText = (message: string) =>
  z.preprocess(
    (value) => (value === null ? "" : value),
    z.string().trim().min(5, message)
  );

const basePreTestSchema = z.object({
  classId: z.string().uuid(),
  groomingFrequency: requiredText("Pilih frekuensi grooming kamu."),
  expectations: requiredLongText("Ceritakan ekspektasi kamu."),
  obstacles: z.array(z.string()).min(1, "Pilih minimal satu kendala."),
  obstacleExplanation: requiredLongText("Jelaskan kendala terbesar kamu."),
  commitments: z.array(z.string())
});

export const femalePreTestSchema = basePreTestSchema.extend({
  gender: z.literal("female"),
  femaleActivities: z
    .array(z.string())
    .min(1, "Pilih minimal satu aktivitas grooming.")
});

export const malePreTestSchema = basePreTestSchema.extend({
  gender: z.literal("male"),
  maleHabits: z
    .array(z.string())
    .min(1, "Pilih minimal satu kebiasaan grooming."),
  maleSkinType: requiredText("Pilih kondisi kulit kamu."),
  maleSocialMediaWilling: z.preprocess(
    (value) => (value === null ? "" : value),
    z.enum(["yes", "no"], {
      message: "Pilih kesediaan untuk posting di media sosial."
    })
  ),
  maleUploadTimeline: requiredText("Pilih timeline upload.")
});

export const postTestSchema = z.object({
  classId: z.string().uuid(),
  likedMost: z.string().trim().min(5, "Ceritakan hal yang paling kamu suka."),
  improvementFeedback: z
    .string()
    .trim()
    .min(5, "Ceritakan hal yang bisa JBA tingkatkan."),
  nextSteps: z.string().trim().min(5, "Ceritakan langkah kamu berikutnya."),
  recommendation: z.enum(["yes", "maybe", "no"]),
  recommendationTarget: z.string().trim().optional(),
  testimonial: z.string().trim().min(5, "Tulis testimoni singkat."),
  contentConsent: z.enum(["yes", "no"]),
  trainerRatings: z
    .array(
      z.object({
        trainerId: z.string().uuid(),
        rating: z.coerce.number().int().min(1).max(5)
      })
    )
    .min(1, "Beri rating untuk setiap trainer atau anggota tim.")
});

export const requiredFemaleCommitments = [
  "follow-instagram",
  "before-photo",
  "on-time"
];

export const requiredMaleCommitments = [
  "follow-instagram",
  "on-time",
  "before-photo",
  "follow-directions"
];

export function validateRequiredCommitments(
  selected: string[],
  required: string[]
) {
  return required.every((commitment) => selected.includes(commitment));
}
