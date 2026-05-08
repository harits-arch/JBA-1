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

export type AdminFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};
