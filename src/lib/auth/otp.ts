import { createHash, randomInt } from "node:crypto";

import { requiredEnv } from "@/lib/env";
import { formatPhoneForFonnte } from "@/lib/auth/phone";

export function generateOtpCode() {
  return randomInt(100000, 999999).toString();
}

export function hashOtpCode(phone: string, otp: string) {
  const secret = requiredEnv("AUTH_SECRET", process.env.AUTH_SECRET);

  return createHash("sha256")
    .update(`${phone}:${otp}:${secret}`)
    .digest("hex");
}

export async function sendOtpWithFonnte(phone: string, otp: string) {
  const token = requiredEnv("FONNTE_TOKEN", process.env.FONNTE_TOKEN);
  const baseUrl = process.env.FONNTE_BASE_URL ?? "https://api.fonnte.com";
  const message = `Kode OTP JBA Student Portal Anda: ${otp}. Berlaku 5 menit. Jangan bagikan kode ini.`;
  const body = new URLSearchParams({
    target: formatPhoneForFonnte(phone),
    message
  });
  const response = await fetch(`${baseUrl}/send`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`Fonnte request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    status?: boolean;
    reason?: string;
    detail?: string;
  };

  if (payload.status === false) {
    throw new Error(payload.reason ?? payload.detail ?? "Fonnte rejected OTP.");
  }
}
