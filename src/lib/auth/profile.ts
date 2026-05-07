import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("Enter a valid email address."),
  gender: z.enum(["female", "male"]),
  dateOfBirth: z.string().min(1, "Date of birth is required."),
  instagramUsername: z
    .string()
    .trim()
    .min(2, "Instagram username is required.")
    .transform((value) => value.replace(/^@/, ""))
});

export type ProfileInput = z.infer<typeof profileSchema>;
