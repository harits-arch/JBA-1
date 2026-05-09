"use server";

import { redirect } from "next/navigation";

import { OTP_TTL_MINUTES } from "@/lib/auth/constants";
import { generateOtpCode, hashOtpCode, sendOtpWithFonnte } from "@/lib/auth/otp";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { createAuthSession } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AuthFormState = {
  status: "idle" | "otp-sent" | "error";
  message?: string;
  phone?: string;
  values?: Record<string, string>;
};

export async function sendRegistrationOtpAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const phone = normalizePhoneNumber(String(formData.get("phone") ?? ""));

  if (phone.length < 10 || !phone.startsWith("+")) {
    return {
      status: "error",
      values: { phone: String(formData.get("phone") ?? "") },
      message:
        "Masukkan nomor WhatsApp dengan benar, contoh 081234567890 atau +6281234567890."
    };
  }

  const otp = generateOtpCode();
  const otpHash = hashOtpCode(phone, otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("auth_otps").insert({
    phone,
    otp_hash: otpHash,
    expires_at: expiresAt.toISOString()
  });

  if (error) {
    return {
      status: "error",
      phone,
      values: { phone },
      message: error.message
    };
  }

  try {
    await sendOtpWithFonnte(phone, otp);
  } catch (caughtError) {
    return {
      status: "error",
      phone,
      values: { phone },
      message:
        caughtError instanceof Error
          ? caughtError.message
          : "Gagal mengirim OTP via Fonnte."
    };
  }

  return {
    status: "otp-sent",
    phone,
    values: { phone },
    message: "OTP sudah dikirim via WhatsApp. Masukkan kode dan buat password."
  };
}

export async function verifyOtpAndCreatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const phone = normalizePhoneNumber(String(formData.get("phone") ?? ""));
  const otp = String(formData.get("otp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (otp.length !== 6) {
    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: "Kode OTP harus 6 digit."
    };
  }

  if (password.length < 8) {
    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: "Password minimal 8 karakter."
    };
  }

  if (password !== confirmPassword) {
    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: "Konfirmasi password tidak sama."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: otpRecord, error: otpError } = await supabase
    .from("auth_otps")
    .select("*")
    .eq("phone", phone)
    .is("consumed_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: otpError.message
    };
  }

  if (!otpRecord || otpRecord.otp_hash !== hashOtpCode(phone, otp)) {
    if (otpRecord) {
      await supabase
        .from("auth_otps")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);
    }

    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: "Kode OTP salah atau sudah kedaluwarsa."
    };
  }

  await supabase
    .from("auth_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", otpRecord.id);

  const passwordHash = hashPassword(password);
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (userError) {
    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: userError.message
    };
  }

  const { data: user, error: writeError } = existingUser
    ? await supabase
        .from("users")
        .update({
          password_hash: passwordHash,
          phone_verified_at: new Date().toISOString()
        })
        .eq("id", existingUser.id)
        .select("*")
        .single()
    : await supabase
        .from("users")
        .insert({
          firebase_uid: `phone:${phone}`,
          role: "student",
          phone,
          password_hash: passwordHash,
          phone_verified_at: new Date().toISOString()
        })
        .select("*")
        .single();

  if (writeError) {
    return {
      status: "otp-sent",
      phone,
      values: { otp, password, confirmPassword },
      message: writeError.message
    };
  }

  await createAuthSession(user.id);
  redirect(user.profile_completed ? "/student/dashboard" : "/onboarding");
}

export async function passwordLoginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const phone = normalizePhoneNumber(String(formData.get("phone") ?? ""));
  const password = String(formData.get("password") ?? "");
  const supabase = createSupabaseAdminClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    return {
      status: "error",
      values: { phone },
      message: error.message
    };
  }

  if (!user || !verifyPassword(password, user.password_hash)) {
    return {
      status: "error",
      values: { phone, password },
      message: "Nomor WhatsApp atau password salah."
    };
  }

  await createAuthSession(user.id);
  redirect(user.profile_completed ? "/student/dashboard" : "/onboarding");
}
