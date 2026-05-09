import { z } from "zod";

export const classFormSchema = z.object({
  clientName: z.string().trim().min(2, "Client name is required."),
  className: z.string().trim().optional(),
  classCode: z.string().trim().optional(),
  classDate: z.string().min(1, "Class date is required."),
  status: z.enum(["draft", "active", "completed", "archived"]),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

export const trainerFormSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().trim().min(2, "Trainer name is required."),
  role: z.string().trim().min(2, "Trainer role is required."),
  displayOrder: z.coerce.number().int().min(0).default(0)
});

export const togglePostTestSchema = z.object({
  classId: z.string().uuid(),
  postTestOpen: z.enum(["true", "false"]).transform((value) => value === "true")
});

export const deleteTrainerSchema = z.object({
  trainerId: z.string().uuid(),
  classId: z.string().uuid()
});

export const updateClassSchema = z.object({
  classId: z.string().uuid("ID kelas tidak valid."),
  clientName: z.string().trim().min(2, "Nama client wajib diisi."),
  className: z.string().trim().optional(),
  classCode: z.string().trim().min(1, "Kode kelas wajib."),
  classDate: z.string().min(1, "Tanggal kelas wajib."),
  status: z.enum(["draft", "active", "completed", "archived"]),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

export const deleteClassSchema = z.object({
  classId: z.string().uuid("ID kelas tidak valid.")
});

export const adminStudentFormSchema = z.object({
  userId: z.string().uuid("ID pengguna tidak valid."),
  fullName: z.string().trim().min(1, "Nama wajib diisi."),
  phone: z
    .string()
    .optional()
    .transform((v) => {
      const s = (v ?? "").trim();
      return s === "" ? null : s;
    }),
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null))
    .refine((v) => v === null || z.string().email().safeParse(v).success, {
      message: "Format email tidak valid."
    }),
  gender: z
    .union([z.enum(["female", "male"]), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? null : v)),
  instagramUsername: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null)),
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v.trim() : null))
});

export const deleteStudentSchema = z.object({
  userId: z.string().uuid("ID pengguna tidak valid.")
});

export const updateTrainerSchema = trainerFormSchema.extend({
  trainerId: z.string().uuid("ID trainer tidak valid.")
});

export type AdminFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  values?: Record<string, string>;
};
