import { z } from "zod";

export type StudentFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
};

export const classRegistrationSchema = z.object({
  classCode: z
    .string()
    .trim()
    .min(3, "Class code is required.")
    .transform((value) => value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
});

const basePreTestSchema = z.object({
  classId: z.string().uuid(),
  groomingFrequency: z.string().min(1, "Please choose a grooming frequency."),
  expectations: z.string().trim().min(5, "Please share your expectations."),
  obstacles: z.array(z.string()).min(1, "Please select at least one obstacle."),
  obstacleExplanation: z
    .string()
    .trim()
    .min(5, "Please describe your biggest obstacle."),
  commitments: z.array(z.string())
});

export const femalePreTestSchema = basePreTestSchema.extend({
  gender: z.literal("female"),
  femaleActivities: z
    .array(z.string())
    .min(1, "Please choose at least one grooming activity.")
});

export const malePreTestSchema = basePreTestSchema.extend({
  gender: z.literal("male"),
  maleHabits: z
    .array(z.string())
    .min(1, "Please choose at least one grooming habit."),
  maleSkinType: z.string().min(1, "Please choose your skin type."),
  maleSocialMediaWilling: z.enum(["yes", "no"]),
  maleUploadTimeline: z.string().min(1, "Please choose an upload timeline.")
});

export const postTestSchema = z.object({
  classId: z.string().uuid(),
  likedMost: z.string().trim().min(5, "Please share what you liked most."),
  improvementFeedback: z
    .string()
    .trim()
    .min(5, "Please share what JBA can improve."),
  nextSteps: z.string().trim().min(5, "Please share your next steps."),
  recommendation: z.enum(["yes", "maybe", "no"]),
  recommendationTarget: z.string().trim().optional(),
  testimonial: z.string().trim().min(5, "Please write a short testimonial."),
  contentConsent: z.enum(["yes", "no"]),
  trainerRatings: z
    .array(
      z.object({
        trainerId: z.string().uuid(),
        rating: z.coerce.number().int().min(1).max(5)
      })
    )
    .min(1, "Please rate each trainer or team member.")
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
